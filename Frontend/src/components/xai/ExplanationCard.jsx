import { Brain } from "lucide-react";
import Section from "../common/Section";
import ShapFeatureList from "./ShapFeatureList";

export default function ExplanationCard({ title, subtitle, features, upLabel, downLabel, defaultOpen = true }) {
  return (
    <Section title={title} subtitle={subtitle} icon={Brain} defaultOpen={defaultOpen}>
      <ShapFeatureList features={features} upLabel={upLabel} downLabel={downLabel} />
    </Section>
  );
}
