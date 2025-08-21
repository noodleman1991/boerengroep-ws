import React from 'react';
import { client } from '../../../tina/__generated__/client';
import { VacanciesPage } from '../../../components/vacancies-page';
import { Section } from '../../../components/layout/section';

export default async function VacanciesRoute() {
    const { data } = await client.queries.vacancyQuery();

    return (
        <div className="min-h-screen">
            <Section>
                <VacanciesPage vacancies={data.vacancyConnection} />
            </Section>
        </div>
    );
}
