"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SA_SUBURBS, suburbLabel } from "@/lib/data/sa-suburbs"

const MAX_RESULTS = 50

interface SuburbComboboxProps {
  name: string
  defaultValue?: string
  placeholder?: string
  id?: string
}

/**
 * Searchable, click-to-select suburb picker backed by the full SA
 * suburb/postcode list. Also accepts free text (e.g. a specific street
 * address, or a place not in the dataset) — the typed query itself is a
 * valid selectable option, it isn't restricted to exact dataset matches.
 */
export function SuburbCombobox({ name, defaultValue = "", placeholder, id }: SuburbComboboxProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SA_SUBURBS.slice(0, MAX_RESULTS)
    return SA_SUBURBS.filter((s) => s.suburb.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
  }, [query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={id}
          className="h-10 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder || "Select a suburb"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search suburb…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim() ? (
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setValue(query.trim())
                    setOpen(false)
                  }}
                >
                  Use &ldquo;{query.trim()}&rdquo;
                </button>
              ) : (
                "No suburb found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {results.map((s) => {
                const label = suburbLabel(s)
                return (
                  <CommandItem
                    key={`${s.suburb}-${s.postcode}`}
                    value={label}
                    onSelect={() => {
                      setValue(label)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("size-4", value === label ? "opacity-100" : "opacity-0")} />
                    {label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
