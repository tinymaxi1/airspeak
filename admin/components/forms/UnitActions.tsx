'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { UnitForm } from './UnitForm';
import { Plus } from 'lucide-react';

export function CreateUnitButton({
  moduleId,
  moduleSlug,
  role,
}: {
  moduleId: string;
  moduleSlug: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Yeni ünite
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <UnitForm
            mode="create"
            moduleId={moduleId}
            moduleSlug={moduleSlug}
            role={role}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
