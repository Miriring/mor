import React, { Component } from 'react'
import Hammer from '../hammer'
import Tool from '../tool'

export default class ListView extends Component {
	static defaultProps = {
		offset: 50,
		bottomEmit: 100,
		enableInfinite: true,
		enableRefresh: true,
		isEnd: false
	}
	
	componentWillMount () {
		const { enableInfinite, enableRefresh, onRefresh, onInfinite } = this.props
		if (enableRefresh && !onRefresh) {
			throw new Error('允许下拉的情况下（enableRefresh: true），onRefresh 回调函数不允许为空')
		}
		if (enableInfinite && !onInfinite) {
			throw new Error('允许加载更多的情况下（enableInfinite: true），onInfinite 回调函数不允许为空')
		}
	}
	
	componentDidMount () {
		this.container = this.refs.container.refs.hammer
		this.wrap = this.refs.wrap
	}
	
	startY = 0 // 起点的位置
	status = 0	// 0-下降状态以及初始状态、1-上升状态、2-停止状态，正在刷新
	top = 0
	touching = false
	infiniting = false // 加载更多区块处理状态中
	
	panstart (e) {
		if (this.container.scrollTop > 0) {
			return
		}
		this.startY = e.targetTouches[0].pageY
		this.touching = true
	}
	
	panmove (e) {
		const { enableRefresh, offset } = this.props
		if (!enableRefresh || !this.touching) {
			return
		}
		
		const diff = e.targetTouches[0].pageY - this.startY
		// if (diff > 0) {
		// 	e.preventDefault();
		// }
		this.top = Math.pow(diff, 0.8) // 弹性阻尼
		this.setHeaderPosition()
		
		if (this.status === 2) {
			return
		}
		
		if (this.top >= offset) {
			this.status = 1	// 位移过程中，超过header高度
		} else {
			this.status = 0	// 位移过程中，未超过header高度
		}
	}
	
	panend (e) {
		const { enableRefresh, offset } = this.props
		if (!enableRefresh || !this.touching) {
			return
		}
		this.touching = false
		
		if (this.status === 2) {
			this.top = offset
			this.setHeaderPosition()
			return
		}
		
		if (this.top >= offset) {
			// 执行刷新
			this.status = 2
			this.top = offset
			this.refresh()
		} else {
			this.status = 0
			this.top = 0
		}
		this.setHeaderPosition()
	}
	
	refresh () {
		const { onRefresh } = this.props
		onRefresh && onRefresh(this.refreshDone.bind(this))
	}
	
	// 刷新结束钩子函数，回调
	refreshDone () {
		this.status = 0
		this.top = 0
		this.setHeaderPosition()
	}
	
	scroll (e) {
		const { enableInfinite } = this.props
	}
	
	// 头部下拉刷新区块位移
	setHeaderPosition () {
		Tool.css(this.wrap, {
			'will-change': 'transform',
			transform: this.top ? `translateY(${this.top}px)` : 'none'
		})
	}
	
	render () {
		const {
			offset,
			enableInfinite,
			isEnd,
			children,
			style
		} = this.props
		
		// section 区块向上初始化隐藏位移
		const sectionSty = { top: -offset }
		// header 下拉刷新区块高度
		const headerSty = { height: offset }
		
		return (
			<Hammer
				className="mona-list-view full o-a pos-r"
				panstart={this.panstart.bind(this)}
				panmove={this.panmove.bind(this)}
				panend={this.panend.bind(this)}
				scroll={this.scroll.bind(this)}
				style={style}
				ref="container">
				<section className="mona-list-view-section pos-a w-full" style={sectionSty} ref="wrap">
					<header className="list-view-refresh" style={headerSty}>refresh...</header>
					{children}
					<If condition={enableInfinite && !isEnd}>
						<footer className="list-view-infinite">loading...</footer>
					</If>
				</section>
			</Hammer>
		)
	}
}