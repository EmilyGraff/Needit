exports.users = {
	getAll: "/users",
	getOne: "/users/:email",
	post: "/users"
}

exports.conversations = {
	getAll: "/conversations",
	getOne: "/conversations/:id",
	post: "/conversations",
	addTrader: "/conversations/:id/traders",
	addMessage: "/conversations/:id/messages",
	getByNeeder: "/conversations/needer/:email"
}