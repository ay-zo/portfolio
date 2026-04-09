"use client";

import DescriptionCard from "./description-card";
import Mockup from "./mockup";
import { useCasePreview } from "../../hooks/use-case-previews";

interface CaseRowProps {
  id: string;
  align: "left" | "right";
}

export default function CaseRow({ id, align }: CaseRowProps) {
  const { data: casePreview } = useCasePreview(id);

  return align === "left" ? (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-row gap-6 px-6">
      <DescriptionCard
        className="w-1/3"
        tags={casePreview?.tags || []}
        year={casePreview?.year || ""}
        caseTitle={casePreview?.title || ""}
        caseSummary={casePreview?.caseSummary || ""}
        impact={casePreview?.impact || []}
        status={casePreview?.status || "confidential"}
      />
      <Mockup className="w-2/3" id={id} align={align} />
    </div>
  ) : (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-row gap-6 px-6">
      <Mockup className="w-2/3" id={id} align={align} />
      <DescriptionCard
        className="w-1/3"
        tags={casePreview?.tags || []}
        year={casePreview?.year || ""}
        caseTitle={casePreview?.title || ""}
        caseSummary={casePreview?.caseSummary || ""}
        impact={casePreview?.impact || []}
        status={casePreview?.status || "confidential"}
      />
    </div>
  );
}
