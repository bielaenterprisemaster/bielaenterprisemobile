import React, { createContext, useMemo, useContext } from 'react';
import {
  Table as ExpoTable,
  THead as ExpoTHead,
  TBody as ExpoTBody,
  TFoot as ExpoTFoot,
  TR as ExpoTR,
  Caption as ExpoTCaption,
} from '@expo/html-elements';

import {
  tableStyle,
  tableHeaderStyle,
  tableBodyStyle,
  tableFooterStyle,
  tableHeadStyle,
  tableRowStyleStyle,
  tableDataStyle,
  tableCaptionStyle,
} from './styles';
import { Text, View } from 'react-native';

const TableHeaderContext = createContext<{
  isHeaderRow: boolean;
}>({
  isHeaderRow: false,
});
const TableFooterContext = createContext<{
  isFooterRow: boolean;
}>({
  isFooterRow: false,
});

// React 19: `ref` is an ordinary prop, so each part passes its element's own
// props (ref included) straight through. React.forwardRef with a generic ref
// type no longer type-checks against React Native 0.88's strict ref types.
type ITableProps = React.ComponentProps<typeof ExpoTable>;
type ITableHeaderProps = React.ComponentProps<typeof ExpoTHead>;
type ITableBodyProps = React.ComponentProps<typeof ExpoTBody>;
type ITableFooterProps = React.ComponentProps<typeof ExpoTFoot>;
type ITableRowProps = React.ComponentProps<typeof ExpoTR>;
type ITableCaptionProps = React.ComponentProps<typeof ExpoTCaption>;
/** A cell is a Text by default, or a View with `useRNView`. */
type ITableCellProps =
  | (React.ComponentProps<typeof View> & { useRNView: true })
  | (React.ComponentProps<typeof Text> & { useRNView?: false });
type ITableHeadProps = ITableCellProps;
type ITableDataProps = ITableCellProps;

function Table({ className, ...props }: ITableProps) {
  return <ExpoTable className={tableStyle({ class: className })} {...props} />;
}

function TableHeader({ className, ...props }: ITableHeaderProps) {
  const contextValue = useMemo(() => {
    return {
      isHeaderRow: true,
    };
  }, []);
  return (
    <TableHeaderContext.Provider value={contextValue}>
      <ExpoTHead className={tableHeaderStyle({ class: className })} {...props} />
    </TableHeaderContext.Provider>
  );
}

function TableBody({ className, ...props }: ITableBodyProps) {
  return <ExpoTBody className={tableBodyStyle({ class: className })} {...props} />;
}

function TableFooter({ className, ...props }: ITableFooterProps) {
  const contextValue = useMemo(() => {
    return {
      isFooterRow: true,
    };
  }, []);
  return (
    <TableFooterContext.Provider value={contextValue}>
      <ExpoTFoot className={tableFooterStyle({ class: className })} {...props} />
    </TableFooterContext.Provider>
  );
}

function TableHead(cellProps: ITableHeadProps) {
  if (cellProps.useRNView) {
    const { useRNView: _view, className, ...props } = cellProps;
    return <View className={tableHeadStyle({ class: className })} {...props} />;
  }
  const { useRNView: _text, className, ...props } = cellProps;
  return <Text className={tableHeadStyle({ class: className })} {...props} />;
}

function TableRow({ className, ...props }: ITableRowProps) {
  const { isHeaderRow } = useContext(TableHeaderContext);
  const { isFooterRow } = useContext(TableFooterContext);

  return (
    <ExpoTR
      className={tableRowStyleStyle({
        isHeaderRow,
        isFooterRow,
        class: className,
      })}
      {...props}
    />
  );
}

function TableData(cellProps: ITableDataProps) {
  if (cellProps.useRNView) {
    const { useRNView: _view, className, ...props } = cellProps;
    return <View className={tableDataStyle({ class: className })} {...props} />;
  }
  const { useRNView: _text, className, ...props } = cellProps;
  return <Text className={tableDataStyle({ class: className })} {...props} />;
}

function TableCaption({ className, ...props }: ITableCaptionProps) {
  return <ExpoTCaption className={tableCaptionStyle({ class: className })} {...props} />;
}

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableFooter.displayName = 'TableFooter';
TableHead.displayName = 'TableHead';
TableRow.displayName = 'TableRow';
TableData.displayName = 'TableData';
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableData,
  TableCaption,
};
