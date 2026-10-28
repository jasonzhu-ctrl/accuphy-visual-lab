import { Component } from 'react'

// A failed WebGL context must leave the explanation and product route available.
export default class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}
