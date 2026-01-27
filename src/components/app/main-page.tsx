"use client";

import { useState, useTransition, useCallback, ChangeEvent, DragEvent, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowRight, Loader2, Trash2, UploadCloud, Search, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { scrapeUrl, scrapeHtml, scrapeBulk, saveProperty } from '@/lib/client-actions';
import { type Property } from '@/lib/types';
import { ResultsTable } from './results-table';
import { downloadJson, downloadCsv, downloadExcel } from '@/lib/export';

const UrlFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
})

const HtmlFormSchema = z.object({
  html: z.string().min(100, { message: "Please enter a substantial amount of HTML." }),
})

export function MainPage() {
  const [results, setResults] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingPropertyId, setSavingPropertyId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');

  // Add filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const urlForm = useForm<z.infer<typeof UrlFormSchema>>({
    resolver: zodResolver(UrlFormSchema),
    defaultValues: { url: "" },
  })

  const htmlForm = useForm<z.infer<typeof HtmlFormSchema>>({
    resolver: zodResolver(HtmlFormSchema),
    defaultValues: { html: "" },
  })

  const handleScrape = useCallback(async (scrapeAction: () => Promise<Property[] | null>) => {
    setIsLoading(true);
    setResults([]);
    startTransition(async () => {
      try {
        const data = await scrapeAction();
        if (data && Array.isArray(data) && data.length > 0) {
          setResults(data);
          toast({ title: "Scraping Successful", description: `Found ${data.length} properties.` });
        } else {
          setResults([]);
          toast({ title: "No Properties Found", description: "No properties were found at the provided URL." });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Scraping Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    });
  }, [toast]);

  const onUrlSubmit = (values: z.infer<typeof UrlFormSchema>) => {
    handleScrape(() => scrapeUrl(values.url));
    urlForm.reset();
  };

  const onHtmlSubmit = (values: z.infer<typeof HtmlFormSchema>) => {
    handleScrape(() => scrapeHtml(values.html));
    htmlForm.reset();
  };

  const handleBulkSubmit = () => {
    if (!bulkUrls.trim()) {
      toast({ variant: "destructive", title: "Input Error", description: "URL list cannot be empty." });
      return;
    }
    handleScrape(() => scrapeBulk(bulkUrls));
    setBulkUrls('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkUrls(content);
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "File Error", description: "Failed to read the file." });
    }
    reader.readAsText(file);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const handleSaveProperty = useCallback((property: Property) => {
    console.log('🔘 Save button clicked for property:', property.title);
    console.log('📋 Property data to save:', {
      id: property.id,
      title: property.title,
      original_title: property.original_title,
      url: property.original_url,
      hasImages: property.image_urls?.length || 0
    });

    setSavingPropertyId(property.id);

    startTransition(async () => {
      try {
        console.log('🚀 Starting save property transaction...');
        const result = await saveProperty(property);
        console.log('📊 Save property result:', result);

        if (result.success) {
          console.log('✅ Property saved successfully');
          toast({
            title: "Property Saved",
            description: result.message || "The property has been added to your database.",
          });
        } else {
          console.log('❌ Property save failed:', result.message);
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: result.message || "Could not save the property to the database.",
          });
        }
      } catch (error) {
        console.error('❌ Exception during save:', error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save the property to the database.",
        });
      } finally {
        setSavingPropertyId(null);
      }
    });
  }, [toast]);

  // Add filtered results logic
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query) ||
        property.neighborhood.toLowerCase().includes(query) ||
        property.property_type.toLowerCase().includes(query) ||
        property.price.toLowerCase().includes(query)
      );
    }

    // Property type filter
    if (selectedPropertyType !== 'all') {
      filtered = filtered.filter(property =>
        property.property_type.toLowerCase() === selectedPropertyType.toLowerCase()
      );
    }

    return filtered;
  }, [results, searchQuery, selectedPropertyType]);

  // Get unique property types for filter dropdown
  const propertyTypes = useMemo(() => {
    const types = [...new Set(results.map(p => p.property_type).filter(Boolean))];
    return types.sort();
  }, [results]);

  return (
    <>
      <div className="w-full max-w-6xl mx-auto space-y-8">

        {/* Hero Section */}
        <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-2">
            <span>✨ AI-Powered Extraction</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Transform Real Estate Data into <span className="text-gradient">Actionable Insights</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Instantly scrape, analyze, and structure property data from any URL with our advanced AI engine.
          </p>
        </div>

        <div className="card-glass rounded-2xl p-1 shadow-2xl ring-1 ring-white/20">
          <Tabs defaultValue="url" className="w-full">
            <div className="px-6 pt-6 pb-2">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md py-3 transition-all duration-300">Scrape by URL</TabsTrigger>
                <TabsTrigger value="html" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md py-3 transition-all duration-300">Scrape by HTML</TabsTrigger>
                <TabsTrigger value="bulk" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md py-3 transition-all duration-300">Bulk Scrape</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="url" className="mt-0 focus-visible:ring-0">
              <Form {...urlForm}>
                <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-6 p-6 sm:p-10">
                  <FormField
                    control={urlForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Property URL</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Paste a link to any property listing (e.g. Zillow, Rightmove, etc.)"
                              className="pl-10 h-12 text-base transition-all border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 bg-white/50"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-full text-base">
                      {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Start Extraction"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="html" className="mt-0 focus-visible:ring-0">
              <Form {...htmlForm}>
                <form onSubmit={htmlForm.handleSubmit(onHtmlSubmit)} className="space-y-6 p-6 sm:p-10">
                  <FormField
                    control={htmlForm.control}
                    name="html"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">HTML Source Code</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste raw HTML content here for direct extraction..."
                            className="min-h-[250px] font-mono text-sm leading-relaxed border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 bg-white/50 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-full text-base">
                      {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Analyze HTML"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bulk" className="mt-0 focus-visible:ring-0">
              <div className="space-y-6 p-6 sm:p-10">
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
                    ${isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => handleDragEvents(e, true)}
                  onDragEnter={(e) => handleDragEvents(e, true)}
                  onDragLeave={(e) => handleDragEvents(e, false)}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Upload Bulk List</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Drag & drop a .txt or .csv file containing URLs, or click to browse.
                  </p>
                  <input id="file-upload" type="file" className="hidden" accept=".txt,.csv" onChange={handleFileChange} />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste manually</span>
                  </div>
                </div>

                <Textarea
                  placeholder="https://example.com/property/1..."
                  className="min-h-[150px] font-mono text-sm border-muted-foreground/20 focus:border-primary/50 bg-white/50"
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleBulkSubmit} disabled={isLoading} className="w-full sm:w-auto h-11 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-full text-base">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Process Batch"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {(isLoading || results.length > 0) && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold">Scraping Results</h2>
              {results.length > 0 && !isLoading && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => downloadJson(filteredResults, 'properties')}>Export JSON</Button>
                  <Button variant="outline" onClick={() => downloadCsv(filteredResults, 'properties')}>Export CSV</Button>
                  <Button variant="outline" onClick={() => downloadExcel(filteredResults, 'properties')}>Export Excel</Button>
                  <Button variant="destructive" size="sm" onClick={() => setResults([])}><Trash2 className="mr-2 h-4 w-4" />Clear Results</Button>
                </div>
              )}
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Add filter section when there are results */}
                {results.length > 0 && (
                  <div className="mb-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search properties by title, location, type, or price..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Property Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Property Types</SelectItem>
                            {propertyTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Showing {filteredResults.length} of {results.length} properties
                      {(searchQuery || selectedPropertyType !== 'all') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedPropertyType('all');
                          }}
                          className="ml-2 h-auto p-1 text-xs"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <ResultsTable
                  properties={filteredResults}
                  onSave={handleSaveProperty}
                  savingPropertyId={savingPropertyId}
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
