"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import {
  saveNotifications,
  type ProfileState,
} from "@/app/(dashboard)/profile/actions";
import { Alert, Button, CheckOption } from "@/components/ui";

const initialState: ProfileState = { status: "idle" };

/**
 * Which emails the journal sends.
 *
 * Grouped by the role each belongs to, so a reviewer is not reading through
 * author settings to find their own. Defaults are on for anything tied to a
 * deadline and off for anything promotional.
 */
const GROUPS: {
  heading: string;
  note?: string;
  items: {
    name: string;
    label: string;
    description: string;
    defaultOn: boolean;
  }[];
}[] = [
  {
    heading: "Your submissions",
    items: [
      {
        name: "submissionStatus",
        label: "Status changes",
        description:
          "When a manuscript moves to review, or a revision you sent is received.",
        defaultOn: true,
      },
      {
        name: "editorialMessages",
        label: "Messages from the editorial office",
        description:
          "A query about one of your manuscripts that is not a decision.",
        defaultOn: true,
      },
    ],
  },
  {
    heading: "Reviewing",
    items: [
      {
        name: "newInvitations",
        label: "New review invitations",
        description:
          "Turning this off does not remove you from the reviewer pool — you will simply see invitations only when you sign in.",
        defaultOn: true,
      },
      {
        name: "reviewReminders",
        label: "Deadline reminders",
        description:
          "A reminder a week before a report is due, and again if it becomes overdue.",
        defaultOn: true,
      },
    ],
  },
  {
    heading: "From the journal",
    items: [
      {
        name: "issuePublished",
        label: "New issue published",
        description: "When an issue goes live, with its table of contents.",
        defaultOn: false,
      },
      {
        name: "journalNews",
        label: "Announcements and calls for papers",
        description: "Occasional. Never more than monthly.",
        defaultOn: false,
      },
    ],
  },
];

export function NotificationsForm({
  /**
   * What this account has actually saved. Absent only before the row is read;
   * each item then falls back to its shipped default, which is what a new
   * account's row already holds anyway.
   */
  saved,
}: {
  saved?: Record<string, boolean>;
}) {
  const [state, formAction] = useFormState(saveNotifications, initialState);

  return (
    <form action={formAction} className="max-w-2xl" noValidate>
      {state.status === "success" && (
        <Alert tone="success" title="Saved" className="mb-6">
          {state.message}
        </Alert>
      )}

      <div className="space-y-8">
        {GROUPS.map((group) => (
          <fieldset key={group.heading}>
            <legend className="font-serif text-base font-semibold">
              {group.heading}
            </legend>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => (
                <CheckOption
                  key={item.name}
                  id={item.name}
                  name={item.name}
                  label={item.label}
                  description={item.description}
                  defaultChecked={
                    state.values
                      ? state.values[item.name] === "on"
                      : (saved?.[item.name] ?? item.defaultOn)
                  }
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Some mail has no switch. Saying which, and why, is better than
          letting someone believe they have turned everything off. */}
      <div className="mt-8 rounded-xl border border-brand-border bg-brand-tint/25 p-4">
        <p className="text-sm font-medium">Always sent</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Decision letters, revision requests, and anything about the security
          of your account are sent regardless of the settings above. These carry
          deadlines you are accountable for, so they cannot be switched off.
        </p>
      </div>

      <div className="mt-8 border-t pt-6">
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
          Save preferences
        </>
      )}
    </Button>
  );
}
