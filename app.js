document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* ==========================================================================
     Navbar Scroll Effect
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* ==========================================================================
     Mobile Menu Toggle
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.setAttribute('data-lucide', 'x');
        } else {
          icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
      }
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
        }
      });
    });
  }

  /* ==========================================================================
     Custom Glow Cursor
     ========================================================================== */
  const cursor = document.getElementById('custom-cursor');
  const cursorGlow = document.getElementById('custom-cursor-glow');

  if (cursor && cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      // Direct positioning
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      
      // Smooth delayed follow for glow
      cursorGlow.animate({
        left: e.clientX + 'px',
        top: e.clientY + 'px'
      }, { duration: 250, fill: 'forwards' });
    });

    // Hover interactive scaling classes
    const interactives = 'a, button, .btn, .walkthrough-step-card, .testimonial-card, .tilt-card';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('hover-interactive');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hover-interactive');
      });
    });
  }

  /* ==========================================================================
     Lenis Smooth Scrolling
     ========================================================================== */
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ==========================================================================
     GSAP & ScrollTrigger Animations
     ========================================================================== */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const stepCards = gsap.utils.toArray('.walkthrough-step-card');
    const screenContents = gsap.utils.toArray('.walkthrough-screen-content');

    // Connect Lenis to ScrollTrigger
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Hero Section Entrance Animations
    const heroTl = gsap.timeline();
    heroTl.from('.hero-tag', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' })
          .from('.hero-title', { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', y: 50, duration: 1.2, ease: 'power4.out' }, '-=0.6')
          .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.8')
          .from('.hero-actions', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .from('.hero-stats-mini', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .from('.hero-visual', { opacity: 0, scale: 0.9, duration: 1.2, ease: 'power4.out' }, '-=1.2');

    // Title reveals (clip-path wipe reveal)
    const titles = gsap.utils.toArray('.section-title, .cta-title');
    titles.forEach(title => {
      gsap.fromTo(title, 
        { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
          },
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out'
        }
      );
    });

    // Features Section Entrance Animations (animates description and tag)
    gsap.from('.features-section .section-header .tag-badge, .features-section .section-header .section-subtitle', {
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      },
      opacity: 0,
      y: 25,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    gsap.from('.tilt-card-wrapper', {
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 80%',
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    /* ==========================================================================
       Prolibu-style Stacking Deck & Walkthrough Pinning (Desktop only)
       ========================================================================== */
    if (window.innerWidth > 1024) {
      // 1. Pin Hero (Section 1) - scales down as Features enters
      ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        pin: true,
        pinSpacing: false
      });
      gsap.to('.hero-section', {
        scale: 0.94,
        opacity: 0.4,
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top bottom',
          end: 'top top',
          scrub: true
        }
      });

      // 2. Pin Features (Section 2) - scales down as Walkthrough enters
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top top',
        pin: true,
        pinSpacing: false
      });
      gsap.to('.features-section', {
        scale: 0.94,
        opacity: 0.4,
        scrollTrigger: {
          trigger: '.how-it-works-section',
          start: 'top bottom',
          end: 'top top',
          scrub: true
        }
      });

      // 3. Pin Walkthrough (Section 3) - pin spacing pushes next section down
      ScrollTrigger.create({
        trigger: '.how-it-works-section',
        start: 'top top',
        end: '+=300%',
        pin: true,
        pinSpacing: true
      });

      // Connect scroll progress of walkthrough to step activation
      let currentStepIndex = 0;
      ScrollTrigger.create({
        trigger: '.how-it-works-section',
        start: 'top top',
        end: '+=300%',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          let activeIdx = 0;
          if (progress > 0.75) activeIdx = 3;
          else if (progress > 0.5) activeIdx = 2;
          else if (progress > 0.25) activeIdx = 1;
          
          if (activeIdx !== currentStepIndex) {
            currentStepIndex = activeIdx;
            activateStep(activeIdx);
          }
        }
      });

      // Scale down Walkthrough as Ecosystem enters
      gsap.to('.how-it-works-section', {
        scale: 0.94,
        opacity: 0.4,
        scrollTrigger: {
          trigger: '.ecosystem-section',
          start: 'top bottom',
          end: 'top top',
          scrub: true
        }
      });

      // 4. Pin Ecosystem (Section 4) - scales down as Reviews enters
      ScrollTrigger.create({
        trigger: '.ecosystem-section',
        start: 'top top',
        pin: true,
        pinSpacing: false
      });
      gsap.to('.ecosystem-section', {
        scale: 0.94,
        opacity: 0.4,
        scrollTrigger: {
          trigger: '.stats-reviews-section',
          start: 'top bottom',
          end: 'top top',
          scrub: true
        }
      });

      // 5. Pin Reviews (Section 5) - scales down as CTA enters
      ScrollTrigger.create({
        trigger: '.stats-reviews-section',
        start: 'top top',
        pin: true,
        pinSpacing: false
      });
      gsap.to('.stats-reviews-section', {
        scale: 0.94,
        opacity: 0.4,
        scrollTrigger: {
          trigger: '.cta-banner-section',
          start: 'top bottom',
          end: 'top top',
          scrub: true
        }
      });
    }

    // (stepCards and screenContents are declared at the start of GSAP block)

    // Handle click interactions on step cards
    stepCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (window.innerWidth > 1024) {
          // If pinned, scroll to correct scroll position of this step
          const pinTrigger = ScrollTrigger.getById('walkthrough-pin') || ScrollTrigger.getAll().find(s => s.trigger === '.how-it-works-section');
          if (pinTrigger) {
            const start = pinTrigger.start;
            const end = pinTrigger.end;
            const scrollPos = start + (index / 3) * (end - start);
            window.scrollTo({ top: scrollPos, behavior: 'smooth' });
          }
        } else {
          activateStep(index);
        }
      });
    });

    // Initialize first step
    activateStep(0);

    function activateStep(index) {
      // Update step text active states
      stepCards.forEach((c, idx) => {
        if (idx === index) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      // Vertical sliding scroll translation inside list (Desktop only)
      if (window.innerWidth > 1024) {
        const list = document.querySelector('.walkthrough-steps-list');
        const cards = document.querySelectorAll('.walkthrough-step-card');
        if (list && cards.length > 0) {
          const cardHeight = cards[0].clientHeight;
          const gap = 24;
          gsap.to(list, {
            y: -index * (cardHeight + gap),
            duration: 0.8,
            ease: 'power3.out'
          });
        }
      }

      // Transition app screens horizontally with prev/next states
      screenContents.forEach((screen, idx) => {
        if (idx === index) {
          screen.className = 'walkthrough-screen-content active';
          
          // Animate inner items sliding in nicely
          const innerItems = screen.querySelectorAll('h3, .pet-photo-frame, .map-container-mock, .vet-video, .sitter-card-mock');
          if (innerItems.length > 0) {
            gsap.fromTo(innerItems, 
              { opacity: 0, x: 20 },
              { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
            );
          }
        } else if (idx < index) {
          screen.className = 'walkthrough-screen-content prev';
        } else {
          screen.className = 'walkthrough-screen-content';
        }
      });

      // Special motion: translate pet marker inside tracking map
      if (index === 1) {
        gsap.fromTo('#pet-marker-walk', 
          { x: -50, y: 50 }, 
          { x: 0, y: 0, duration: 2, ease: 'power2.out' }
        );
      }
    }

    // Counter animations on Scroll
    gsap.from('.stat-counter-card', {
      scrollTrigger: {
        trigger: '.stats-counters-container',
        start: 'top 80%',
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      onComplete: () => {
        // Trigger values counting
        document.querySelectorAll('.counter-number').forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
          const countObj = { val: 0 };
          
          gsap.to(countObj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              let valueStr = countObj.val.toFixed(decimals);
              if (target >= 1000) {
                // Add comma separators
                valueStr = Math.floor(countObj.val).toLocaleString() + '+';
              } else if (decimals > 0) {
                valueStr = valueStr + '★';
              } else {
                valueStr = valueStr + '/7';
              }
              counter.textContent = valueStr;
            }
          });
        });
      }
    });

    // Testimonial entrance
    gsap.from('.testimonial-carousel-wrapper', {
      scrollTrigger: {
        trigger: '.testimonials-container',
        start: 'top 80%',
      },
      opacity: 0,
      scale: 0.95,
      y: 40,
      duration: 1,
      ease: 'power3.out'
    });

    // CTA Section entrance
    gsap.from('.cta-box-wrapper', {
      scrollTrigger: {
        trigger: '#download',
        start: 'top 75%',
      },
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out'
    });
  }

  /* ==========================================================================
     Interactive 3D Perspective Hero Visual & Badges Parallax
     ========================================================================== */
  const heroContainer = document.querySelector('.hero-section');
  const deviceScene = document.querySelector('.device-scene');
  const parallaxElements = document.querySelectorAll('.parallax-element');

  if (heroContainer && deviceScene) {
    heroContainer.addEventListener('mousemove', (e) => {
      // Don't tilt on smaller tablet/mobile viewports
      if (window.innerWidth <= 1024) return;

      const rect = heroContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Normalized coordinates from -0.5 to 0.5
      const mouseX = (x / rect.width) - 0.5;
      const mouseY = (y / rect.height) - 0.5;

      // Rotate smartphone frame
      const tiltX = mouseY * 25; // max tilt 25deg
      const tiltY = mouseX * 25;
      
      gsap.to(deviceScene, {
        rotateX: -tiltX,
        rotateY: tiltY,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Shift floating badges slightly based on depth
      parallaxElements.forEach(element => {
        const depth = parseFloat(element.getAttribute('data-depth')) || 0.1;
        const moveX = mouseX * depth * 250;
        const moveY = mouseY * depth * 250;

        gsap.to(element, {
          x: moveX,
          y: moveY,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    });

    // Reset layout elements on mouseleave
    heroContainer.addEventListener('mouseleave', () => {
      gsap.to(deviceScene, {
        rotateX: 8,
        rotateY: -10,
        duration: 1,
        ease: 'power3.out'
      });

      parallaxElements.forEach(element => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 1,
          ease: 'power3.out'
        });
      });
    });
  }

  /* ==========================================================================
     Feature Cards 3D Mouse Tilt
     ========================================================================== */
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const mouseX = (x / rect.width) - 0.5;
      const mouseY = (y / rect.height) - 0.5;

      const rotateY = mouseX * 20; // 20 degrees max
      const rotateX = -mouseY * 20;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });

  /* ==========================================================================
     Testimonial Carousel Slide Controller
     ========================================================================== */
  const track = document.getElementById('testimonial-track');
  const cardsList = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('#carousel-dots .dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (track && cardsList.length > 0) {
    let currentIndex = 0;
    const maxIndex = cardsList.length - 1;
    let autoScrollInterval;

    function updateCarousel() {
      // Translate track
      const offset = currentIndex * -100;
      gsap.to(track, {
        x: offset + '%',
        duration: 0.7,
        ease: 'power3.out'
      });

      // Update dots
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function showNext() {
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0; // Wrap around
      }
      updateCarousel();
    }

    function showPrev() {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = maxIndex; // Wrap around
      }
      updateCarousel();
    }

    if (nextBtn) nextBtn.addEventListener('click', () => {
      showNext();
      resetAutoScroll();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      showPrev();
      resetAutoScroll();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        currentIndex = idx;
        updateCarousel();
        resetAutoScroll();
      });
    });

    // Auto rotate every 6 seconds
    function startAutoScroll() {
      autoScrollInterval = setInterval(showNext, 6000);
    }

    function resetAutoScroll() {
      clearInterval(autoScrollInterval);
      startAutoScroll();
    }

    // Drag / Touch gestures on carousel
    let startX = 0;
    let isDragging = false;

    track.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      isDragging = true;
      clearInterval(autoScrollInterval);
    });

    track.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = e.clientX - startX;
      
      if (diffX < -50) {
        showNext();
      } else if (diffX > 50) {
        showPrev();
      } else {
        updateCarousel();
      }
      startAutoScroll();
    });

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      clearInterval(autoScrollInterval);
    });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = e.changedTouches[0].clientX - startX;
      
      if (diffX < -50) {
        showNext();
      } else if (diffX > 50) {
        showPrev();
      } else {
        updateCarousel();
      }
      startAutoScroll();
    });

    startAutoScroll();
  }

  /* ==========================================================================
     Interactive Dog & Cat Profile Switcher (Hero Mockup)
     ========================================================================== */
  const btnSwitchDog = document.getElementById('btn-switch-dog');
  const btnSwitchCat = document.getElementById('btn-switch-cat');

  const appAvatar = document.getElementById('app-avatar');
  const appPetName = document.getElementById('app-pet-name');
  const appScoreText = document.getElementById('app-score-text');
  const appScoreCircle = document.getElementById('app-score-circle');
  const appSummaryDesc = document.getElementById('app-summary-desc');
  const appActivityIcon = document.getElementById('app-activity-icon');
  const appActivityLabel = document.getElementById('app-activity-label');
  const appActivitySub = document.getElementById('app-activity-sub');
  const appHydrationIcon = document.getElementById('app-hydration-icon');
  const appHydrationLabel = document.getElementById('app-hydration-label');
  const appHydrationSub = document.getElementById('app-hydration-sub');
  const appVetAvatar = document.getElementById('app-vet-avatar');
  const appVetName = document.getElementById('app-vet-name');
  const appVetDate = document.getElementById('app-vet-date');

  if (btnSwitchDog && btnSwitchCat) {
    btnSwitchDog.addEventListener('click', () => {
      if (btnSwitchDog.classList.contains('active')) return;
      
      btnSwitchDog.classList.add('active');
      btnSwitchCat.classList.remove('active');

      // Dog profile data
      appAvatar.className = 'app-avatar-circle profile-buster';
      appPetName.innerHTML = 'Buster &bull; Golden Retriever';
      appScoreText.textContent = '92%';
      appScoreCircle.setAttribute('stroke-dasharray', '92, 100');
      appSummaryDesc.textContent = 'Buster is active and healthy today!';
      
      appActivityIcon.textContent = '🏃‍♂️';
      appActivityLabel.textContent = '6,420 Steps';
      appActivitySub.textContent = 'Goal: 8,000';

      appHydrationIcon.textContent = '💧';
      appHydrationLabel.textContent = '800ml logged';
      appHydrationSub.textContent = 'Goal: 1000ml';

      appVetAvatar.className = 'visit-vet-avatar doc-sarah';
      appVetName.textContent = 'Dr. Sarah Jenkins';
      appVetDate.textContent = 'Tomorrow at 10:00 AM';

      // Animate updates inside the card summary
      gsap.from('.app-card-summary, .app-sections-grid, .app-card-upcoming', {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      });
    });

    btnSwitchCat.addEventListener('click', () => {
      if (btnSwitchCat.classList.contains('active')) return;

      btnSwitchCat.classList.add('active');
      btnSwitchDog.classList.remove('active');

      // Cat profile data
      appAvatar.className = 'app-avatar-circle profile-whiskers';
      appPetName.innerHTML = 'Whiskers &bull; British Shorthair';
      appScoreText.textContent = '88%';
      appScoreCircle.setAttribute('stroke-dasharray', '88, 100');
      appSummaryDesc.textContent = 'Whiskers is sleeping well and fully fed!';

      appActivityIcon.textContent = '💤';
      appActivityLabel.textContent = '12h Sleeping';
      appActivitySub.textContent = 'Goal: 14h';

      appHydrationIcon.textContent = '💧';
      appHydrationLabel.textContent = '250ml logged';
      appHydrationSub.textContent = 'Goal: 300ml';

      appVetAvatar.className = 'visit-vet-avatar doc-sarah'; // keep same vet
      appVetName.textContent = 'Dr. Alex Carter';
      appVetDate.textContent = 'Friday at 2:00 PM';

      // Animate updates inside the card summary
      gsap.from('.app-card-summary, .app-sections-grid, .app-card-upcoming', {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      });
    });
  }

  /* ==========================================================================
     Ecosystem Section Interactions (Community, Shop, Lost & Found)
     ========================================================================== */
  // 1. Post Like Button
  const btnPostLike = document.getElementById('btn-post-like');
  const likeCountEl = document.getElementById('like-count');
  if (btnPostLike && likeCountEl) {
    let liked = true; // starts liked
    btnPostLike.addEventListener('click', () => {
      liked = !liked;
      if (liked) {
        btnPostLike.classList.add('active-heart');
        likeCountEl.textContent = '48 Likes';
        gsap.fromTo(btnPostLike.querySelector('.heart-icon'), { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      } else {
        btnPostLike.classList.remove('active-heart');
        likeCountEl.textContent = '47 Likes';
      }
    });
  }

  // 2. Add to Cart Notifications (Toast)
  const addCartButtons = document.querySelectorAll('.btn-add-cart');
  addCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const product = button.getAttribute('data-product');
      showToast(`🛒 Added "${product}" to your shopping cart!`);
    });
  });

  // 3. Report Sighting Button
  const btnReportSighting = document.getElementById('btn-report-sighting');
  if (btnReportSighting) {
    btnReportSighting.addEventListener('click', () => {
      showToast(`🚨 Sighting reported! Search grids updated and owners notified.`);
    });
  }

  // Helper function to create/show glassmorphic toast notification
  function showToast(message) {
    // Remove existing toast if present
    const existingToast = document.querySelector('.simbly-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create Toast element
    const toast = document.createElement('div');
    toast.className = 'simbly-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: rgba(30, 34, 41, 0.9);
      backdrop-filter: blur(10px);
      color: #FFF;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 10000;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: none;
      transform: translateY(20px);
      opacity: 0;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // GSAP Animation
    gsap.to(toast, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
      onComplete: () => {
        // Fade out after 2.5 seconds
        gsap.to(toast, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          delay: 2.5,
          ease: 'power3.in',
          onComplete: () => toast.remove()
        });
      }
    });
  }
});
