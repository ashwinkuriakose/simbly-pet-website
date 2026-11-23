// Contact form: client-side checks that mirror the API, then POST JSON to the public contact endpoint.
// Responses: 201 success · 400 {field: [msg]} · 429 rate limited · anything else is a retryable failure.

type Errors = Record<string, string>;

const FIELDS = ['enquiry_type', 'business_name', 'name', 'email', 'phone', 'city', 'message'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function values(form: HTMLFormElement) {
  const data = new FormData(form);
  const get = (k: string) => String(data.get(k) ?? '').trim();
  return {
    enquiry_type: get('enquiry_type') || 'general',
    name: get('name'),
    email: get('email'),
    phone: get('phone'),
    business_name: get('business_name'),
    city: get('city'),
    message: get('message'),
    page: window.location.pathname,
    website: String(data.get('website') ?? ''),
  };
}

function validate(v: ReturnType<typeof values>): Errors {
  const e: Errors = {};
  if (v.name.length < 2) e.name = 'Please enter your name.';
  else if (v.name.length > 120) e.name = 'Please keep your name under 120 characters.';
  if (!v.email) e.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(v.email)) e.email = 'Please enter a valid email address.';
  if (v.message.length < 10) e.message = 'Please write at least 10 characters.';
  else if (v.message.length > 5000) e.message = 'Please keep your message under 5000 characters.';
  if (v.phone.length > 30) e.phone = 'Please keep the phone number under 30 characters.';
  if (v.city.length > 100) e.city = 'Please keep the city under 100 characters.';
  if (v.enquiry_type === 'business' && !v.business_name) e.business_name = 'Please tell us the name of your business.';
  else if (v.business_name.length > 160) e.business_name = 'Please keep the business name under 160 characters.';
  return e;
}

function setup(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = submit.querySelector<HTMLElement>('[data-label]')!;
  const businessOnly = form.querySelector<HTMLElement>('[data-business-only]');
  const idleLabel = label.textContent;

  const control = (name: string) =>
    form.querySelector<HTMLElement>(`[name="${name}"]:not([type="radio"])`) ??
    form.querySelector<HTMLElement>(`[name="${name}"]:checked`);

  function showStatus(kind: 'success' | 'error', text: string) {
    status.dataset.kind = kind;
    status.textContent = text;
    status.hidden = false;
    status.focus();
  }

  function clearErrors() {
    status.hidden = true;
    status.textContent = '';
    form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
      el.hidden = true;
      el.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  // Show field errors; returns false if some messages had no field to attach to.
  function showErrors(errors: Errors) {
    let first: HTMLElement | null = null;
    const general: string[] = [];
    for (const [field, msg] of Object.entries(errors)) {
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      const input = control(field);
      // The slot itself starts hidden, so check its ancestors (e.g. the business-only field) instead.
      const fieldHidden = slot?.parentElement?.closest('[hidden]') != null;
      if (slot && (FIELDS as readonly string[]).includes(field) && !fieldHidden) {
        slot.textContent = msg;
        slot.hidden = false;
        input?.setAttribute('aria-invalid', 'true');
        first ??= input;
      } else {
        general.push(msg);
      }
    }
    if (general.length) showStatus('error', general.join(' '));
    // Focus the first invalid field in page order.
    else (form.querySelector<HTMLElement>('[aria-invalid="true"]') ?? first)?.focus();
  }

  function toggleBusiness() {
    if (!businessOnly) return;
    const isBusiness = values(form).enquiry_type === 'business';
    businessOnly.hidden = !isBusiness;
  }

  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'enquiry_type') toggleBusiness();
  });
  // Clear a field's error as soon as the person edits it.
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.getAttribute('aria-invalid') !== 'true') return;
    t.removeAttribute('aria-invalid');
    const slot = form.querySelector<HTMLElement>(`[data-error-for="${t.name}"]`);
    if (slot) slot.hidden = true;
  });
  toggleBusiness();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.getAttribute('aria-busy') === 'true') return;
    clearErrors();

    const v = values(form);
    const local = validate(v);
    if (Object.keys(local).length) {
      showErrors(local);
      return;
    }

    const body: Record<string, string> = { ...v };
    if (v.enquiry_type !== 'business') delete body.business_name;

    submit.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    label.textContent = 'Sending…';
    try {
      const res = await fetch(form.dataset.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201 || res.ok) {
        form.reset();
        toggleBusiness();
        showStatus('success', (data && data.detail) || form.dataset.msgSuccess!);
      } else if (res.status === 400) {
        const errors: Errors = {};
        for (const [k, msgs] of Object.entries(data as Record<string, unknown>)) {
          const msg = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
          errors[k === 'non_field_errors' || k === 'detail' ? '__all__' : k] = msg;
        }
        if (!Object.keys(errors).length) errors.__all__ = form.dataset.msgNetwork!;
        showErrors(errors);
      } else if (res.status === 429) {
        showStatus('error', form.dataset.msgRatelimit!);
      } else {
        showStatus('error', form.dataset.msgNetwork!);
      }
    } catch {
      showStatus('error', form.dataset.msgNetwork!);
    } finally {
      submit.removeAttribute('aria-busy');
      submit.disabled = false;
      label.textContent = idleLabel;
    }
  });
}

document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(setup);
