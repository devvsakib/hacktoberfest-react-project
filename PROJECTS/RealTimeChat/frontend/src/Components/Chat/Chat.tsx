import { FC, useEffect, useState, useRef } from 'react'

import type { Props, IMessages, IUsers, IMessage, IUser } from './Types'

import {
	Container,
	Users as UsersStyled,
	User,
	ChatBox,
	MessagesStyled,
	Message,
	Input,
	InputContainer,
	Button,
	MessageText,
	MessageSender,
	MessageWrapper,
} from './Styles'

const Chat: FC<Props> = ({ socket, username }) => {
	const [Text, SetText] = useState('')
	const [Messages, SetMessages] = useState<IMessages>([])
	const [Users, SetUsers] = useState<IUsers>([])

	const LastMessageRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (Notification.permission !== 'granted') {
			Notification.requestPermission()
		}

		socket.once('message:history', (messages: IMessages) => {
			SetMessages(messages)
		})

		socket.once('users:history', (messages: IUsers) => {
			SetUsers([
				{ id: socket.id, username, disconected: false },
				...messages.map((user: IUser) => ({
					...user,
					disconnected: false,
				})),
			])
		})

		socket.on('message:receive', (message: IMessage) => {
			SetMessages(prev => [...prev, message])

			const sender: string =
				Users.find(user => user.id === message.sender)?.username ??
				'Not Found'

			new Notification(`New message by ${sender}`, {
				body: message.message.substring(0, 100),
			})
		})

		socket.on('users:disconnect', ({ id }: { id: string }) => {
			SetUsers(prev =>
				prev.map(user => {
					if (user.id === id) return { ...user, disconected: true }

					return user
				})
			)
		})

		socket.on('users:new', ({ id, username }: IUser) => {
			SetUsers(prev => [...prev, { id, username, disconected: false }])
		})

		return () => {
			socket.off()
		}
	}, [Users, socket, username])

	useEffect(() => {
		LastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [Messages])

	const SendMessage = () => {
		if (!Text) return

		const message = Text.trim()

		socket.emit('message:send', message, (id: string) => {
			SetMessages(prev => [...prev, { message, id, sender: socket.id }])
		})

		SetText('')
	}

	return (
		<Container>
			<UsersStyled>
				<h3>Users</h3>
				{Users.map(
					({ id, username, disconected }) =>
						!disconected && (
							<User me={id === socket.id} key={id}>
								{username}
							</User>
						)
				)}
			</UsersStyled>
			<ChatBox>
				<MessagesStyled>
					{Messages.map(({ sender, message, id }) => (
						<Message mine={sender === socket.id} key={id}>
							<div ref={LastMessageRef}></div>
							<MessageWrapper>
								<MessageSender>
									{Users.find(user => user.id === sender)
										?.username ?? 'Not Found'}
								</MessageSender>
								<MessageText>{message}</MessageText>
							</MessageWrapper>
						</Message>
					))}
				</MessagesStyled>
				<InputContainer>
					<Input
						placeholder='Text'
						onChange={event => SetText(event.target.value)}
						value={Text}
					/>
					<Button onClick={SendMessage}>Send</Button>
				</InputContainer>
			</ChatBox>
		</Container>
	)
}

export default Chat
