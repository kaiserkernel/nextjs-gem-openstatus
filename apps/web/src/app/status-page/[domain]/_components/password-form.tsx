"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputWithAddons,
} from "@openstatus/ui";

import { LoadingAnimation } from "@/components/loading-animation";
import { useCookieState } from "@/hooks/use-cookie-state";
import { toast, toastAction } from "@/lib/toast";
import { createProtectedCookieKey } from "../utils";
import { handleValidatePassword } from "./actions";

// TODO: add 'hide/show' button to show the password
// FIXME: we could do the `?authorize` thing in the server side (e.g. middleware) - but not
// in the `layout.tsx` because we cannot access the search params there

const schema = z.object({
  password: z.string(),
});

type Schema = z.infer<typeof schema>;

export function PasswordForm({ slug }: { slug: string }) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });
  const [loading, setLoading] = useState(true);
  const [inputType, setInputType] = useState<"password" | "text">("password");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [_, handleChange] = useCookieState(createProtectedCookieKey(slug)); // what if we do not define the expires date?

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (searchParams.has("authorize")) {
      const authorize = searchParams.get("authorize");
      if (!authorize) return;
      form.setValue("password", authorize);
    }
    setLoading(false);
  }, []);

  async function onSubmit(data: Schema) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("password", data.password);
        formData.append("slug", slug);

        const res = await handleValidatePassword(formData);

        if (res?.error || res.data === undefined) {
          toast.error(res.error || "An error occurred. Please retry.");
          return;
        }

        handleChange(res.data);
        toastAction("saved");

        router.replace(pathname);
        router.refresh();
      } catch {
        toastAction("error");
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full gap-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputWithAddons
                  placeholder="top-secret"
                  type={inputType}
                  disabled={loading}
                  trailing={
                    // biome-ignore lint/a11y/useButtonType: <explanation>
                    <button
                      onClick={() =>
                        setInputType((type) =>
                          type === "password" ? "text" : "password",
                        )
                      }
                    >
                      {inputType === "password" ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size="lg" disabled={isPending || loading}>
          {isPending || loading ? <LoadingAnimation /> : "Confirm"}
        </Button>
      </form>
    </Form>
  );
}
