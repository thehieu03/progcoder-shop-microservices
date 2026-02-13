// Type declarations for modules without type definitions

declare module 'react-collapse' {
  import * as React from 'react';

  interface CollapseProps {
    isOpened: boolean;
    children?: React.ReactNode;
    className?: string;
    springConfig?: object;
    forceInitialAnimation?: boolean;
    hasNestedCollapse?: boolean;
    fixedHeight?: number;
    style?: React.CSSProperties;
    theme?: {
      collapse?: string;
      content?: string;
    };
    onInit?: (props: { hasNestedCollapse: boolean }) => void;
    onRest?: () => void;
    onMeasure?: (props: { height: number }) => void;
  }

  export class Collapse extends React.Component<CollapseProps> {}
  export class UnmountClosed extends React.Component<CollapseProps> {}
}

declare module 'simplebar-react' {
  import * as React from 'react';

  interface SimpleBarProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    scrollableNodeProps?: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };
    autoHide?: boolean;
    forceVisible?: boolean | 'x' | 'y';
    direction?: 'rtl' | 'ltr';
    timeout?: number;
    clickOnTrack?: boolean;
    scrollbarMinSize?: number;
    scrollbarMaxSize?: number;
  }

  export default class SimpleBar extends React.Component<SimpleBarProps> {}
}

declare module 'react-table';

declare module 'cleave.js/react' {
  import * as React from 'react';

  export interface CleaveProps {
    value?: string | number;
    options?: Record<string, unknown>;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    name?: string;
    readOnly?: boolean;
    disabled?: boolean;
    [key: string]: unknown;
  }

  const Cleave: React.ComponentType<CleaveProps>;
  export default Cleave;
}
