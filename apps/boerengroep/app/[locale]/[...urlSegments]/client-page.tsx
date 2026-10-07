"use client";
import { useTina } from "tinacms/dist/react";
import { Blocks } from "@/components/blocks";
import { PageQuery } from "@/tina/__generated__/types";
import ErrorBoundary from "@/components/error-boundary";

export interface ClientPageProps {
    data: {
        page: PageQuery["page"];
    };
    variables: {
        relativePath: string;
    };
    query: string;
    events?: any[];
    globalData?: any;
}

export default function ClientPage(props: ClientPageProps) {
    const { data } = useTina({ ...props });
    const { events = [], globalData } = props;

    return (
        <ErrorBoundary>
            <Blocks {...data?.page} events={events} globalData={globalData} />
        </ErrorBoundary>
    );
}

// "use client";
// import { useTina } from "tinacms/dist/react";
// import { Blocks } from "@/components/blocks";
// import { PageQuery } from "@/tina/__generated__/types";
// import ErrorBoundary from "@/components/error-boundary";
//
// export interface ClientPageProps {
//   data: {
//     page: PageQuery["page"];
//   };
//   variables: {
//     relativePath: string;
//   };
//   query: string;
// }
//
// export default function ClientPage(props: ClientPageProps) {
//   const { data } = useTina({ ...props });
//   return (
//     <ErrorBoundary>
//       <Blocks {...data?.page} />
//     </ErrorBoundary>
//   );
// }
