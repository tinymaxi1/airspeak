'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { LessonForm } from './LessonForm';
import { ExerciseForm } from './ExerciseForm';
import { Plus } from 'lucide-react';

export function CreateLessonButton({
  unitId,
  unitSlug,
  role,
  moduleSlug,
}: {
  unitId: string;
  unitSlug: string;
  role: string;
  moduleSlug: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Yeni ders
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <LessonForm
            mode="create"
            unitId={unitId}
            unitSlug={unitSlug}
            role={role}
            moduleSlug={moduleSlug}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditLessonButton({
  lesson,
  unitId,
  unitSlug,
  role,
  moduleSlug,
}: {
  lesson: any;
  unitId: string;
  unitSlug: string;
  role: string;
  moduleSlug: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <LessonForm
            mode="edit"
            unitId={unitId}
            unitSlug={unitSlug}
            role={role}
            moduleSlug={moduleSlug}
            initial={lesson}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CreateExerciseButton({
  lessonId,
  lessonSlug,
  treePath,
  nextSort,
}: {
  lessonId: string;
  lessonSlug: string;
  treePath: string;
  nextSort: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Egzersiz
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ExerciseForm
            mode="create"
            lessonId={lessonId}
            lessonSlug={lessonSlug}
            treePath={treePath}
            nextSort={nextSort}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditExerciseButton({
  exercise,
  lessonId,
  lessonSlug,
  treePath,
}: {
  exercise: any;
  lessonId: string;
  lessonSlug: string;
  treePath: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ExerciseForm
            mode="edit"
            lessonId={lessonId}
            lessonSlug={lessonSlug}
            treePath={treePath}
            nextSort={exercise.sort}
            initial={exercise}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
