"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/(marketing)/contact/actions";
import {
  Alert,
  Button,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const TOPICS = [
  { value: "submission", label: "A manuscript submission" },
  { value: "review", label: "Peer review or reviewing for us" },
  { value: "editorial", label: "Editorial or scope enquiry" },
  { value: "technical", label: "Technical problem with the site" },
  { value: "charges", label: "Publication charges" },
  { value: "permissions", label: "Permissions and reuse" },
  { value: "other", label: "Something else" },
];

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction] = useFormState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <p className="mt-4 font-serif text-xl font-bold">Message sent</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Message not sent">
          {state.message}
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          htmlFor="name"
          required
          error={state.errors?.name}
        >
          <Input name="name" defaultValue={v.name} autoComplete="name" />
        </Field>

        <Field
          label="Email address"
          htmlFor="email"
          required
          error={state.errors?.email}
          hint="We will reply to this address."
        >
          <Input
            name="email"
            type="email"
            defaultValue={v.email}
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="Institution" htmlFor="affiliation" optional>
        <Input
          name="affiliation"
          defaultValue={v.affiliation}
          autoComplete="organization"
          placeholder="University or organisation"
        />
      </Field>

      <Field
        label="What is your enquiry about?"
        htmlFor="topic"
        required
        error={state.errors?.topic}
      >
        <Select name="topic" defaultValue={v.topic ?? ""} required>
          <option value="" disabled>
            Choose a subject
          </option>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Manuscript ID"
        htmlFor="manuscriptId"
        optional
        hint="If your enquiry concerns a manuscript already with us, quote its ID so we can find it quickly."
      >
        <Input
          name="manuscriptId"
          defaultValue={v.manuscriptId}
          placeholder="e.g. BORJSS-2026-014"
        />
      </Field>

      <Field
        label="Message"
        htmlFor="message"
        required
        error={state.errors?.message}
        hint="Please include any detail that would help us answer without a further exchange."
      >
        <Textarea name="message" rows={7} defaultValue={v.message} />
      </Field>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton />
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-danger">*</span> are required.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Sending…
        </>
      ) : (
        <>
          <Send className="size-4" aria-hidden />
          Send message
        </>
      )}
    </Button>
  );
}
