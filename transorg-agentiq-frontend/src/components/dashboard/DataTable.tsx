import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

export default function DataTable<T>({ columns, rows, keyField }: { columns: Column<T>[]; rows: T[]; keyField: (row: T) => string }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2.5 text-[11px] mono uppercase text-mystic/45 font-medium ${
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyField(row)} className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-2.5 text-mystic/80 ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
