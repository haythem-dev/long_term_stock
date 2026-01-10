import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema, type InsertItem } from "@shared/schema";
import { useCreateItem } from "@/hooks/use-items";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreateItemDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createItem = useCreateItem();

  const form = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: "",
      description: "",
      completed: false
    }
  });

  async function onSubmit(data: InsertItem) {
    try {
      await createItem.mutateAsync(data);
      toast({ title: "Item created", description: "Successfully added new item." });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create item",
        variant: "destructive" 
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">Create Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Alpha" {...field} className="input-minimal text-lg font-medium px-0 border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief details about the task..." 
                      {...field} 
                      value={field.value || ''}
                      className="resize-none bg-secondary/30 border-0 focus-visible:ring-0 focus-visible:bg-secondary/50 transition-colors min-h-[100px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createItem.isPending} className="w-full sm:w-auto">
                {createItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
