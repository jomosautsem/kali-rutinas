import { TemplateSuggester } from "@/components/template-suggester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminTemplatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Template Management</h1>
                    <p className="text-muted-foreground">Create, edit, and manage workout templates.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Template
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Full Body HIIT</CardTitle>
                        <CardDescription>High-intensity interval training for all major muscle groups.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">Edit</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Beginner Strength</CardTitle>
                        <CardDescription>A 3-day split for those new to weightlifting.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button variant="secondary" className="w-full">Edit</Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Advanced Calisthenics</CardTitle>
                        <CardDescription>Master your bodyweight with advanced progressions.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button variant="secondary" className="w-full">Edit</Button>
                    </CardContent>
                </Card>
            </div>

            <TemplateSuggester />

        </div>
    )
}
