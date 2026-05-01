import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';

interface Group {
  id: string;
  role: string | null;
  level_tier: string | null;
  class_tier: string;
  member_count: number;
}

export function GroupRow({ group }: { group: Group }) {
  return (
    <Link
      href={`/leagues/groups/${group.id}`}
      className="block border border-border rounded-lg p-3 bg-white hover:bg-secondary/30 transition"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {group.role ?? '—'} · {group.level_tier ?? '—'}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Users className="w-3 h-3" />
            <span>{group.member_count} üye</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
