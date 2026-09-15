import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { message: string | null };

export class R3FErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('R3F render failed', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.message) {
      return <p className="hud-error hud-scene-error">{this.state.message}</p>;
    }
    return this.props.children;
  }
}
