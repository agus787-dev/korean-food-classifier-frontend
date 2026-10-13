import type { ReactNode } from 'react'

export interface DataColumn<Row> {
  key: string
  header: string
  render: (row: Row) => ReactNode
  className?: string
}

interface DataTableProps<Row> {
  columns: Array<DataColumn<Row>>
  rows: Row[]
  rowKey: (row: Row) => string
}

export function DataTable<Row>({ columns, rows, rowKey }: DataTableProps<Row>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-background text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`px-4 py-3 font-semibold ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="align-middle">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
