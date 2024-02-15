import type { Monitor, Notification } from "@openstatus/db/src/schema";

const postToWebhook = async (body: any, webhookUrl: string) => {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const sendAlert = async ({
  monitor,
  notification,
  statusCode,
  message,
}: {
  monitor: Monitor;
  notification: Notification;
  statusCode?: number;
  message?: string;
}) => {
  const notificationData = JSON.parse(notification.data);
  const { slack: webhookUrl } = notificationData; // webhook url
  const { name } = monitor;

  try {
    await postToWebhook(
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Your monitor <${monitor.url}/|${name}> with ${
                statusCode
                  ? `status code ${statusCode}`
                  : `error message ${message}`
              } 🚨  \n\n Powered by <https://www.openstatus.dev/|OpenStatus>.`,
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Monitor",
                emoji: true,
              },
              value: `monitor_url_${monitor.url}`,
              url: monitor.url,
            },
          },
        ],
      },
      webhookUrl,
    );
  } catch (err) {
    console.log(err);
    // Do something
  }
};

export const sendRecovery = async ({
  monitor,
  notification,
  statusCode,
  message,
}: {
  monitor: Monitor;
  notification: Notification;
  statusCode?: number;
  message?: string;
}) => {
  const notificationData = JSON.parse(notification.data);
  const { slack: webhookUrl } = notificationData; // webhook url
  const { name } = monitor;

  try {
    await postToWebhook(
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Your monitor <${monitor.url}/|${name}> is up again
              🚀  \n\n Powered by <https://www.openstatus.dev/|OpenStatus>.`,
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Monitor",
                emoji: true,
              },
              value: `monitor_url_${monitor.url}`,
              url: monitor.url,
            },
          },
        ],
      },
      webhookUrl,
    );
  } catch (err) {
    console.log(err);
    // Do something
  }
};

export const sendTestSlackMessage = async (webhookUrl: string) => {
  try {
    await postToWebhook(
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This is a test notification from <https://www.openstatus.dev/|OpenStatus>.\n If you can read this, your Slack webhook is functioning correctly!",
            },
          },
        ],
      },
      webhookUrl,
    );
    return true;
  } catch (err) {
    return false;
  }
};
