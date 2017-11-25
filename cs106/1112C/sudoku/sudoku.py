# sudoku.py
# Solve Sudoku boards!

BOX_SIZE = 3
ROW_SIZE = BOX_SIZE * BOX_SIZE

def solve(board, graphics, row=0, col=0):
	if col >= ROW_SIZE:
		col = 0
		row += 1
		if row >= ROW_SIZE:
			return True
	
	if board[row][col] != None:
		return solve(board, graphics, row, col + 1)
	
	for i in range(1, ROW_SIZE + 1):
		if canPlace(i, board, row, col):
			graphics.attempt(i, row, col)
			board[row][col] = i
			if solve(board, graphics, row, col + 1):
				graphics.accept(row, col)
				return True
			else:
				graphics.reject(row, col)
	
	board[row][col] = None
	return False

def canPlace(num, board, row, col):
	for i in range(0, ROW_SIZE):
		if board[row][i] == num or board[i][col] == num:
			return False
	
	boxRow = (row / BOX_SIZE) * BOX_SIZE
	boxCol = (col / BOX_SIZE) * BOX_SIZE
	for i in range(0, BOX_SIZE):
		for j in range(0, BOX_SIZE):
			if board[boxRow + i][boxCol + j] == num:
				return False
	
	return True
