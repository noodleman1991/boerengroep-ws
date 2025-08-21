import {
    DotIcon,
    PaletteIcon,
    SettingsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useCalendar } from "../contexts/calendar-context";
import type { TCalendarView } from "../types";

export function Settings() {
    const {
        badgeVariant,
        setBadgeVariant,
        use24HourFormat,
        toggleTimeFormat,
        view,
        setView,
    } = useCalendar();

    const t = useTranslations('calendar');

    const isDotVariant = badgeVariant === "dot";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title={t('settings.title')}>
                    <SettingsIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{t('settings.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <div className="flex items-center gap-2">
                            {isDotVariant ? (
                                <DotIcon className="w-4 h-4" />
                            ) : (
                                <PaletteIcon className="w-4 h-4" />
                            )}
                            {t('settings.badgeVariant')}
                        </div>
                        <DropdownMenuShortcut>
                            <Switch
                                checked={isDotVariant}
                                onCheckedChange={(checked) =>
                                    setBadgeVariant(checked ? "dot" : "colored")
                                }
                            />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <div className="flex items-center gap-2">
                            {use24HourFormat ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-clock-24 h-4 w-4"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M3 12a9 9 0 0 0 5.998 8.485m12.002 -8.485a9 9 0 1 0 -18 0" />
                                    <path d="M12 7v5" />
                                    <path d="M12 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2" />
                                    <path d="M18 15v2a1 1 0 0 0 1 1h1" />
                                    <path d="M21 15v6" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-clock-12 h-4 w-4"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M3 12a9 9 0 0 0 9 9m9 -9a9 9 0 1 0 -18 0" />
                                    <path d="M12 7v5l.5 .5" />
                                    <path d="M18 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2" />
                                    <path d="M15 21v-6" />
                                </svg>
                            )}
                            {t('settings.timeFormat')}
                        </div>
                        <DropdownMenuShortcut>
                            <Switch
                                checked={use24HourFormat}
                                onCheckedChange={toggleTimeFormat}
                            />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="w-56">
                    <DropdownMenuLabel>{t('settings.defaultView')}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                        value={view}
                        onValueChange={(value) => setView(value as TCalendarView)}
                    >
                        <DropdownMenuRadioItem value="month">{t('views.month')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="agenda">{t('views.agenda')}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
