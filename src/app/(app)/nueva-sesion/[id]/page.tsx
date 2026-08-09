import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TRACKS } from "@/lib/tracks";

export default async function BlueprintPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
  if (!session || session.candidateId !== user.id) notFound();

  const track = TRACKS.find((t) => t.slug === session.trackSlug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blueprint — {track?.name ?? session.trackSlug}</CardTitle>
        <CardDescription>
          Esto es lo que el entrevistador va a usar como guía. Revisa antes de empezar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {session.blueprintContent}
        </p>
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={`/sesion/${session.id}`} />}
        >
          Comenzar entrevista
        </Button>
      </CardContent>
    </Card>
  );
}
