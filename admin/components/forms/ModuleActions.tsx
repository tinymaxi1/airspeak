'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { ModuleForm } from './ModuleForm';
import { Plus } from 'lucide-react';

export function CreateModuleButton({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Yeni modül
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ModuleForm mode="create" role={role} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditModuleButton({
  role,
  module,
}: {
  role: string;
  module: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ModuleForm mode="edit" role={role} initial={module} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
