import type { Assertion } from "@openstatus/assertions";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/dashboard/tabs";
import { ResponseAssertion } from "./response-assertion";
import { ResponseHeaderTable } from "./response-header-table";
import { ResponseTimingTable } from "./response-timing-table";
import type { Timing } from "./utils";

export async function ResponseDetailTabs({
  timing,
  headers,
  status,
  message,
  assertions,
}: {
  timing: Timing | null;
  headers: Record<string, string> | null;
  status: number | null;
  message?: string | null;
  assertions?: Assertion[] | null;
}) {
  const defaultValue = headers ? "headers" : timing ? "timing" : "message";
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="headers" disabled={!headers}>
          Headers
        </TabsTrigger>
        <TabsTrigger value="timing" disabled={!timing}>
          Timing
        </TabsTrigger>
        <TabsTrigger value="message" disabled={!message}>
          Message
        </TabsTrigger>
        <TabsTrigger
          value="assertions"
          disabled={!assertions || assertions.length === 0}
        >
          Assertions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="headers">
        {headers ? (
          <ResponseHeaderTable headers={headers} status={status || 0} />
        ) : null}
      </TabsContent>
      <TabsContent value="timing">
        {/* TODO: show hideInfo={false} when in /play/checker page */}
        {timing ? <ResponseTimingTable timing={timing} hideInfo /> : null}
      </TabsContent>
      <TabsContent value="message">
        {message ? (
          <div>
            <pre
              className="text-wrap rounded-md bg-muted p-4 text-sm"
              // @ts-expect-error some issues with types
              style={{ textWrap: "wrap" }}
            >
              {message}
            </pre>
            <p className="mt-4 text-center text-muted-foreground text-sm">
              Response Message
            </p>
          </div>
        ) : null}
      </TabsContent>
      <TabsContent value="assertions">
        {assertions ? <ResponseAssertion {...{ assertions }} /> : null}
      </TabsContent>
    </Tabs>
  );
}
