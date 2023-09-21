import { PageLayout} from "../../../../components/ui/page-layout"
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "../../../../components/tables/ideas/data-table";
import { columns } from "../../../../components/tables/ideas/columns";
import useSWR from "swr"
import React from "react";

export default function ProjectIdeas() {
    const { data, isLoading } = useSWR("/api/openstad/api/project");

    if (!data) return null;

    return (
        <div>
            <PageLayout
                pageHeader="Projecten"
                breadcrumbs={[
                    {
                        name: "Projecten",
                        url: "/projects"
                    },
                    {
                        name: "Subscribers nieuwsbrief",
                        url: "/projects/1/subscribers"
                    }
                ]}
                action={
                    <Link href="/projects/1/ideas/export">
                        <Button variant="default">
                            <Plus size="20" />
                            Exporteer subscribers
                        </Button>
                    </Link>
                }
            >
                <div className="container">
                    <DataTable columns={columns} data={data} />
                </div>
            </PageLayout>
        </div>
    )
}