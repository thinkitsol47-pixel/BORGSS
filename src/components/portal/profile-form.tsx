"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Building2, Globe, Mail, Save, User } from "lucide-react";
import {
  saveProfile,
  type ProfileState,
} from "@/app/(dashboard)/profile/actions";
import { COUNTRIES } from "@/config/countries";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import type { CurrentUser } from "@/lib/auth/current-user";

const initialState: ProfileState = { status: "idle" };

const BIO_MAX = 1500;

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [state, formAction] = useFormState(saveProfile, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      {state.status === "success" && (
        <Alert tone="info" title="Not saved">
          {state.message}
        </Alert>
      )}
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not save">
          {state.message}
        </Alert>
      )}

      <Field
        label="Full name"
        htmlFor="name"
        required
        error={state.errors?.name}
        hint="As it should appear on a published article."
      >
        <Input
          name="name"
          defaultValue={v.name ?? user.name}
          autoComplete="name"
          icon={<User />}
        />
      </Field>

      <Field
        label="Email address"
        htmlFor="email"
        required
        error={state.errors?.email}
        hint="Used for decisions, review invitations and everything else the journal sends you."
      >
        <Input
          name="email"
          type="email"
          defaultValue={v.email ?? user.email}
          autoComplete="email"
          icon={<Mail />}
        />
      </Field>

      <Field
        label="Institution"
        htmlFor="institution"
        required
        error={state.errors?.institution}
      >
        <Input
          name="institution"
          defaultValue={v.institution ?? ""}
          autoComplete="organization"
          placeholder="University or organisation"
          icon={<Building2 />}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Department"
          htmlFor="department"
          optional
          error={state.errors?.department}
        >
          <Input name="department" defaultValue={v.department ?? ""} />
        </Field>

        <Field
          label="Position"
          htmlFor="position"
          optional
          error={state.errors?.position}
          hint="e.g. Assistant Professor"
        >
          <Input
            name="position"
            defaultValue={v.position ?? ""}
            autoComplete="organization-title"
          />
        </Field>
      </div>

      <Field
        label="Country"
        htmlFor="country"
        required
        error={state.errors?.country}
      >
        <Input
          name="country"
          defaultValue={v.country ?? ""}
          autoComplete="country-name"
          list="country-list"
          placeholder="Start typing…"
          icon={<Globe />}
        />
      </Field>
      <datalist id="country-list">
        {COUNTRIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <Field
        label="Short biography"
        htmlFor="bio"
        optional
        error={state.errors?.bio}
        hint="Shown to editors selecting reviewers. Your research interests and methods matter more here than your career history. It is never shown to authors."
      >
        <Textarea
          name="bio"
          rows={5}
          maxLength={BIO_MAX}
          defaultValue={v.bio ?? ""}
        />
      </Field>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Saving…
        </>
      ) : (
        <>
          <Save className="size-4" aria-hidden />
          Save changes
        </>
      )}
    </Button>
  );
}
