import { Resend } from "resend";

import { Alert, EmailDataSchema } from "./emails/alert";
import SubscribeEmail from "./emails/subscribe";
import { validateEmailNotDisposable } from "./emails/utils/utils";
import WaitingList from "./emails/waiting-list";
import WelcomeEmail from "./emails/welcome";
import { env } from "./env";

export {
  WelcomeEmail,
  WaitingList,
  validateEmailNotDisposable,
  Alert,
  EmailDataSchema,
  SubscribeEmail,
};

export const resend = new Resend(env.RESEND_API_KEY);

export interface Emails {
  react: JSX.Element;
  subject: string;
  to: string[];
  from: string;
}

export const sendEmail = async (email: Emails) => {
  await resend.emails.send(email);
};
