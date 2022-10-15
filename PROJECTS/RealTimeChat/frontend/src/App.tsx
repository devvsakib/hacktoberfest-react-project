import { FC, useState, useEffect } from 'react'

// eslint-disable-next-line import/no-named-as-default
import io, { Socket } from 'socket.io-client'

import Chat from 'Components/Chat/Chat'

import { Button, Container, InnerContainer, Input } from './AppStyles'

const App: FC = () => {
	const [Username, SetUsername] = useState('')

	const [IsConnected, SetIsConnected] = useState(false)

	const [Socket, SetSocket] = useState<Socket | null>(null)

	const Connect = () => {
		if (Username.length < 3) return alert('Username minimum length is 3')

		const connection = io('ws://localhost:8080', {
			query: {
				username: Username,
			},
		})

		SetIsConnected(true)
		SetSocket(connection)
	}

	useEffect(
		() => () => {
			Socket?.disconnect()
		},
		[]
	)

	if (IsConnected && Socket) return <Chat socket={Socket} />

	return (
		<Container>
			<InnerContainer>
				<Input
					placeholder='Username'
					onChange={event => SetUsername(event.target.value)}
					value={Username}
				/>
				<Button onClick={Connect}>Join</Button>
			</InnerContainer>
		</Container>
	)
}

export default App
