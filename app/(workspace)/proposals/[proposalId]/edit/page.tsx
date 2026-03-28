"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { TimelineEditor } from "@/components/features/proposals/timeline-editor";
import { PricingEditor } from "@/components/features/proposals/pricing-editor";
import { SignatureBlock } from "@/components/features/proposals/signature-block";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  GripVertical,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  PenTool,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  type: string;
  content: unknown;
  position: number;
}

interface Proposal {
  id: string;
  title: string;
  type: string;
  status: string;
  client: { id: string; name: string } | null;
  sections: Section[];
}

const sectionIcons: Record<string, typeof FileText> = {
  RICH_TEXT: FileText,
  TIMELINE: Calendar,
  PRICING: DollarSign,
  PENALTY: AlertTriangle,
  SIGNATURE: PenTool,
  BY_HOURS_CONFIG: Clock,
};

export default function ProposalEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const proposalId = params.proposalId as string;

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [sectionContents, setSectionContents] = useState<
    Record<string, string>
  >({});

  const { data: proposal, isLoading } = useQuery<Proposal>({
    queryKey: ["proposal", proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}`);
      if (!res.ok) throw new Error("Failed to fetch proposal");
      const data = await res.json();
      setTitle(data.title);
      if (!activeSection && data.sections.length > 0) {
        setActiveSection(data.sections[0].id);
      }
      // Initialize section contents
      const contents: Record<string, string> = {};
      for (const s of data.sections) {
        contents[s.id] =
          typeof s.content === "string"
            ? s.content
            : s.content
              ? JSON.stringify(s.content)
              : "";
      }
      setSectionContents(contents);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save title
      await fetch(`/api/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      // Save section contents
      if (proposal) {
        const sections = proposal.sections.map((s) => ({
          id: s.id,
          content: sectionContents[s.id] || "",
        }));

        await fetch(`/api/proposals/${proposalId}/sections`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      toast.success("Proposal saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const addSectionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Section",
          type: "RICH_TEXT",
          position: (proposal?.sections.length || 0),
        }),
      });
      if (!res.ok) throw new Error("Failed to add section");
      return res.json();
    },
    onSuccess: (section) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      setActiveSection(section.id);
      toast.success("Section added");
    },
  });

  const updateContent = useCallback(
    (sectionId: string, content: string) => {
      setSectionContents((prev) => ({ ...prev, [sectionId]: content }));
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!proposal) return null;

  const currentSection = proposal.sections.find(
    (s) => s.id === activeSection
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/proposals")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none bg-transparent text-xl font-bold outline-none focus:ring-0"
            placeholder="Proposal title..."
          />
          <Badge variant="outline">
            {proposal.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
          </Badge>
          <Badge>{proposal.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/proposals/${proposalId}/preview`)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex flex-1 gap-0 overflow-hidden pt-4">
        {/* Sections sidebar */}
        <div className="w-64 shrink-0 overflow-y-auto border-r border-[var(--border)] pr-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">
              SECTIONS
            </h3>
            <button
              onClick={() => addSectionMutation.mutate()}
              className="rounded p-1 hover:bg-[var(--secondary)]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {proposal.sections.map((section) => {
              const Icon = sectionIcons[section.type] || FileText;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      activeSection === section.id
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "hover:bg-[var(--secondary)]"
                    )}
                  >
                    <GripVertical className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto pl-6">
          {currentSection ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                {currentSection.title}
              </h2>

              {currentSection.type === "RICH_TEXT" && (
                <div className="rounded-lg border border-[var(--border)]">
                  {/* Toolbar placeholder */}
                  <div className="flex flex-wrap gap-1 border-b border-[var(--border)] p-2">
                    {["B", "I", "U", "S", "Link", "H2", "H3", "H4", "UL", "OL"].map(
                      (btn) => (
                        <button
                          key={btn}
                          className="rounded px-2 py-1 text-xs font-medium hover:bg-[var(--secondary)]"
                        >
                          {btn}
                        </button>
                      )
                    )}
                  </div>
                  <textarea
                    value={sectionContents[currentSection.id] || ""}
                    onChange={(e) =>
                      updateContent(currentSection.id, e.target.value)
                    }
                    className="min-h-[400px] w-full resize-none border-none bg-transparent p-4 text-sm outline-none"
                    placeholder="Start writing content for this section..."
                  />
                </div>
              )}

              {currentSection.type === "TIMELINE" && (
                <TimelineEditor proposalId={proposalId} />
              )}

              {currentSection.type === "PRICING" && (
                <PricingEditor proposalId={proposalId} />
              )}

              {currentSection.type === "PENALTY" && (
                <div className="rounded-lg border border-[var(--border)] p-6">
                  <Input
                    label="Penalty Price Per Day ($)"
                    type="number"
                    placeholder="50"
                    className="mb-4 max-w-xs"
                  />
                  <textarea
                    value={sectionContents[currentSection.id] || ""}
                    onChange={(e) =>
                      updateContent(currentSection.id, e.target.value)
                    }
                    className="min-h-[200px] w-full resize-none rounded-lg border border-[var(--border)] bg-transparent p-4 text-sm outline-none"
                    placeholder="Describe penalty terms and conditions..."
                  />
                </div>
              )}

              {currentSection.type === "SIGNATURE" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <SignatureBlock
                    label="Agency Signature"
                    onSign={(name) =>
                      toast.success(`Signed as ${name}`)
                    }
                  />
                  <SignatureBlock
                    label="Client Signature"
                    readOnly
                  />
                </div>
              )}

              {currentSection.type === "BY_HOURS_CONFIG" && (
                <div className="space-y-4 rounded-lg border border-[var(--border)] p-6">
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] p-4 hover:bg-[var(--secondary)]">
                      <input type="radio" name="hourType" value="OPEN_HOURS" />
                      <div>
                        <p className="font-medium">Open Hours</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          No monthly limit
                        </p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] p-4 hover:bg-[var(--secondary)]">
                      <input type="radio" name="hourType" value="LIMITED_HOURS" />
                      <div>
                        <p className="font-medium">Limited Hours</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Fixed monthly allocation
                        </p>
                      </div>
                    </label>
                  </div>
                  <Input
                    label="Hourly Rate ($)"
                    type="number"
                    placeholder="150"
                    className="max-w-xs"
                  />
                  <Input
                    label="Monthly Hours (if limited)"
                    type="number"
                    placeholder="40"
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Select a section from the sidebar to start editing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
