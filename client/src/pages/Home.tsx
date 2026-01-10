import { useItems, useDeleteItem } from "@/hooks/use-items";
import { CreateItemDialog } from "@/components/CreateItemDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, PackageOpen, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: items, isLoading, error } = useItems();
  const deleteItem = useDeleteItem();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteItem.mutateAsync(id);
      toast({ title: "Deleted", description: "Item removed successfully" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-12 bg-primary/20 overflow-hidden rounded-full">
            <div className="h-full bg-primary w-1/2 animate-[shimmer_1s_infinite]" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        <p>Error loading items. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/5">
      <main className="max-w-3xl mx-auto px-6 py-24">
        
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tight text-primary">
              Project <span className="font-semibold">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Manage your tasks and ideas in a clean, distraction-free environment.
            </p>
          </div>
          <CreateItemDialog />
        </header>

        {/* Content Section */}
        <div className="space-y-6">
          {items?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-2xl bg-secondary/5"
            >
              <div className="bg-secondary rounded-full p-4 mb-4">
                <PackageOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No items found</h3>
              <p className="text-muted-foreground mt-1 mb-6 max-w-xs mx-auto">
                Get started by creating your first item using the button above.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {items?.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    layout
                  >
                    <Card className="group relative overflow-hidden border border-border/40 bg-card hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <div className="p-6 flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            {item.completed && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                Completed
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteItem.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Subtle hover indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300" />
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
