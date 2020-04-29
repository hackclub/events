import { useEffect } from 'react'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'


export default () => {
	useEffect(() => {
		setInterval(async () => {
			let res = await fetch('api/redirect').then((res) => res.json())

			if (res.redirect == null) {
				console.log('not yet!')
				return
			}

			window.location.href = res.redirect
		}, 500)
	}, [])
	return (
		<p>cool content page thing goes here very good</p>
		)
}