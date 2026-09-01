"use client"

import { ExecuteGraphButton } from "@/components/graph/ExecuteGraphButton";
import { Graph, GraphInputs, GraphOutputs } from "@/components/graph/Graph";
import { createGraphStore, GraphStoreContext } from "@/components/graph/GraphContextProvider";
import { Node } from "@/components/graph/Node";
import { SortGraphButton } from "@/components/graph/SortGraphButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/ui/Section";
import { createNode } from "@/lib/graph/CreateNode.factory";
import { NODE_INPUT_IO_NAME, NODE_OUTPUT_IO_NAME } from "@/lib/graph/NodeDefinitions";
import { NODE_SETTING_UI_LABEL_TEXT } from "@/lib/graph/NodeSettings";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

export default function Page() {
  return (
    <>
      <Section variant="primary">
        <h2 className="header-section-1">header 1</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat quidem vel eaque cum fugit nobis sit cumque ut aspernatur, inventore ipsa aut sunt illum error officiis optio unde id sapiente.</p>
        <h1 className="header-section-1">header-section-1</h1>
        <h2 className="header-section-2">header-section-2</h2>
        <h3 className="header-section-3">header-section-3</h3>
        <h4 className="header-section-4">header-section-4</h4>
        <div className="flex flex-row gap-4 mt-4 flex-wrap">
          <Button variant={"default"}>default</Button>
          <Button variant={"default"} disabled>disabled</Button>
          <Button variant={"secondary"}>secondary</Button>
          <Button variant={"secondary"} disabled>disabled</Button>
          <Button variant={"destructive"}>destructive</Button>
          <Button variant={"destructive"} disabled>disabled</Button>
          <Button variant={"ghost"}>ghost</Button>
          <Button variant={"ghost"} disabled>disabled</Button>
          <Button variant={"link"}>link</Button>
          <Button variant={"link"} disabled>disabled</Button>
          <Button variant={"outline"}>outline</Button>
          <Button variant={"outline"} disabled>disabled</Button>
        </div>
      </Section>

      <Section variant="ghost" className="mt-8">
        <h1 className="header-section-1">Colors</h1>
        All colors are defined in the theme file.

        <h3 className="header-section-3">With complementary foreground color</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg">Primary</div>
          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">Secondary</div>
          <div className="bg-destructive text-destructive-foreground p-4 rounded-lg">Destructive</div>
          <div className="bg-muted text-muted-foreground p-4 rounded-lg">Muted</div>
          <div className="bg-accent text-accent-foreground p-4 rounded-lg">Accent</div>
          <div className="bg-popover text-popover-foreground p-4 rounded-lg">Popover</div>
          <div className="bg-code text-code-foreground p-4 rounded-lg">Code</div>
          <div className="bg-card text-card-foreground p-4 rounded-lg">Card</div>
          <div className="bg-success text-success-foreground p-4 rounded-lg">Success</div>
        </div>

        <h3 className="header-section-3">Without complementary foreground color</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="bg-border text-foreground p-4 rounded-lg">border</div>
          <div className="bg-input text-background p-4 rounded-lg">input</div>
          <div className="bg-ring text-background p-4 rounded-lg">ring</div>
          <div className="bg-background text-foreground p-4 rounded-lg">background</div>
          <div className="bg-foreground text-background p-4 rounded-lg">foreground</div>
          <div className="bg-border text-foreground p-4 rounded-lg">border</div>
        </div>
      </Section>

      <Section variant={"primary"} className="mt-8">
        <h1 className="header-section-1">Primary Section</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perspiciatis, tempore rem quidem incidunt repellat omnis obcaecati placeat a in explicabo nam, fuga accusantium odio atque hic doloribus. Quasi, ea molestiae.</p>
      </Section>
      <Section variant={"ghost"} className="mt-8">
        <h1 className="header-section-1">Ghost Section</h1>
        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odit distinctio nostrum eaque sequi, dolores ex neque molestias, id vel quidem laboriosam nesciunt porro! Impedit, dolorum sapiente. Veritatis itaque quia consectetur.</p>
        <p>Dolor sit amet consectetur adipisicing elit. Minima rem repellendus nesciunt magni aliquid, enim fugiat? Exercitationem vero ducimus corrupti sint aperiam sapiente, labore alias aspernatur incidunt. Beatae, itaque? ! Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque consequatur quibusdam labore deserunt dolorem. Voluptatibus quas quam nesciunt quos sapiente tenetur cupiditate illum ex numquam quia. Dolore saepe vitae officiis.</p>
      </Section>


      <Section variant={"default"} className="mt-8">
        <h1 className="header-section-1">Default Section</h1>
      </Section>

      <Section variant={"ghost"} className="mt-8">
        <h1 className="header-section-1">Cards</h1>
        <Card className="w-[350px] mt-4">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Deploy your new project in one-click.</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Name of your project" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>
      </Section>
      <Section variant={"ghost"}>
        <Alert variant={"default"}>
          <InfoCircledIcon />
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.
          </AlertDescription>
        </Alert>
      </Section>
      <Section variant={"ghost"}>
        <Alert variant={"destructive"}>
          <ExclamationTriangleIcon />
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.
          </AlertDescription>
        </Alert>
      </Section>
      <Section variant="ghost">
        <h1 className="header-section-1">Graph</h1>
        <UiDemoGraph />
      </Section>
    </>
  );
}

function UiDemoGraph() {
  const graphStore = createGraphStore();

  graphStore.getState().initialize([
    createNode("inputNumeric", "1", { x: 50, y: 50 }),
    createNode("round", "2", { x: 300, y: 50 }),
    createNode("output", "3", { x: 500, y: 50 }, { [NODE_SETTING_UI_LABEL_TEXT]: { value: "Result" } }),
  ], [{
    fromIO: { nodeId: "1", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "2", nodeIOName: "number" },
  }, {
    fromIO: { nodeId: "2", nodeIOName: "result" },
    toIO: { nodeId: "3", nodeIOName: NODE_OUTPUT_IO_NAME },
  },
  ]);


  return <GraphStoreContext.Provider
    value={graphStore}
  >
    <Section variant={"ghost"} className="flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <Card className="w-full mt-2">
          <CardContent>
            <div className="flex flex-col gap-2 w-full mt-4">
              <h2 className="header-section-3 mb-1">Inputs</h2>
              <GraphInputs />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full mt-2">
          <CardContent>
            <div className="flex flex-col gap-2 w-full mt-4">
              <h2 className="header-section-3 mb-1">Outputs</h2>
              <GraphOutputs />
            </div>
          </CardContent>
          <CardFooter className="flex">
            <span className="flex flex-col w-full">
              <Item variant="destructive">
                <ItemContent>
                  <ItemTitle>Error Message</ItemTitle>
                  <ItemDescription>
                    A simple item with title and description.
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="outline" className="bg-transparent" size="sm">
                    View Node
                  </Button>
                </ItemActions>
              </Item>
            </span>
          </CardFooter>
        </Card>
      </div>
    </Section>

    <Section variant={"ghost"} className="flex items-center gap-4">
      <SortGraphButton />
      <ExecuteGraphButton />
      <div className="flex-grow h-[1px] bg-primary-foreground"/>
    </Section>

    <Section variant={"ghost"}>
      <Graph className="h-64" />
    </Section>
  </GraphStoreContext.Provider>

}