## 12. Notices and email flows

- Good news about a form ("A new link is on its way.") uses `FormNotice`, the green counterpart of `FormError`. Both are announced to screen readers.
- Anything that can reveal whether an account exists (sign-up, resend, password reset) must answer identically for known and unknown emails.
- "Send again" buttons show a countdown instead of an error, so the user knows when to try again.
- Emails follow the same look as the app: dark panel, one accent pill button, plain-text version always included.
