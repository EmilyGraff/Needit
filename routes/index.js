exports.users = {
	getAll: "/users",
	getOne: "/users/:email",
	post: "/users",
	addTrade: "/users/:email/trades",
	addNeed: "/users/:email/needs",
	addNotification: "/users/:email/notifications",
	addComment: "/users/:email/comments",
	addTransaction: "/users/:email/transactions"
}

exports.conversations = {
	getAll: "/conversations",
	getOne: "/conversations/:id",
	post: "/conversations",
	addTrader: "/conversations/:id/traders",
	addMessage: "/conversations/:id/messages",
	getByNeeder: "/conversations/needer/:email"
}