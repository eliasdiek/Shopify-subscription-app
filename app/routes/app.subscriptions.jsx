import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      query getCustomer($id: ID!) {
        customer(id: $id) {
          id
          firstName
          lastName
          email
          paymentMethods(first: 10) {
            edges {
              node {
                id
                subscriptionContracts(first: 10) {
                  edges {
                    node {
                      id
                      nextBillingDate
                      note
                      status
                      lines(first: 5) {
                        edges {
                          node {
                            id
                            productId
                            variantId
                            title
                            quantity
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        id: "gid://shopify/Customer/6572206260390",
      },
    }
  );
  const responseJson = await response.json();

  console.log('[responseJson]', responseJson);

  return json({
    customer: responseJson.data.customer,
  });
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const createSubscription = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <ui-title-bar title="Remix app template">
        <button variant="primary" onClick={createSubscription}>
          Create a subscription
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Congrats on creating a new Shopify app for HC 🎉
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={createSubscription}>
                    Create a subscription
                  </Button>
                </InlineStack>

                {actionData?.customer && (
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                    overflowX="scroll"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>{JSON.stringify(actionData.customer, null, 2)}</code>
                    </pre>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
