import DomainItem from "../DomainItem/DomainItem";
import type { DomainResult } from "@/lib/types";

type Props = {
  results: DomainResult[];
};

export function DomainList({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-3">
      {results.map((item, index) => (
        <DomainItem
          key={item.domain}
          domain={item.domain}
          available={item.available}
          reason={item.reason}
          index={index}
        />
      ))}
    </div>
  );
}
