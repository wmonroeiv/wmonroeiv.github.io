#!/usr/bin/env python

"""
Sudoku solver -- graphical front-end
Will Monroe
CS 106B optional demo, 4 May 2012

The author hereby releases this work into the public domain.
"""
	# The triple-quote string above ^ is called a "docstring." It is used
	# in place of a comment summarizing the file, and Python recognizes
	# it as intended for documentation. Try starting a Python interpreter,
	# importing this file [import graphics] and calling
	#     help(graphics)

import time
import os
import random

# This program uses an open-source library called wxPython (www.wxpython.org)
# to create its GUI. This is my favorite Python library--it has an incredible
# array of standard GUI elements (buttons, menus, text boxes, etc.) and is
# super well-documented and easy to use. It also has a huge demo program that
# shows you how to use each and every control that comes with it.
import wx
import wx.grid

import sudoku

def StringToSudoku(string):
	'''
	Converts a single-character Python string into either a number or None
	for use in a Sudoku board.
	'''
	try:
		return int(string)
	except ValueError:
		# Can't be converted to an integer, so we consider it empty
		return None

def SudokuToString(sudoku):
	'''
	Converts a number or None from the standard Sudoku board format to
	a string for displaying on the graphical grid.
	'''
	if sudoku == None:
		return ''
	else:
		return str(sudoku)

class SudokuBoard:
	def __init__(self, window):
		# This is how Python handles classes. __init__ is the special name for
		# the constructor of the class. The first parameter to every object
		# method is the object itself, called "self" by convention. self is
		# like "this" in Java/C++, except you have to explicitly mention it
		# whenever you want to use instance variables or methods.
		grid = wx.grid.Grid(parent=window)
		grid.CreateGrid(sudoku.ROW_SIZE, sudoku.ROW_SIZE)

		# Set row and column sizes, and fix them so the user can't change them
		grid.SetRowLabelSize(0)
		grid.SetColLabelSize(0)
		grid.SetDefaultRowSize(40, True)
		grid.SetDefaultColSize(40, True)
		grid.DisableDragGridSize()

		# Change cell attributes to work well for Sudoku displaying
		font = grid.GetDefaultCellFont()
		font.SetPointSize(20)
		grid.SetDefaultCellFont(font)
		grid.SetDefaultCellAlignment(wx.ALIGN_CENTER, wx.ALIGN_CENTER)

		self.grid = grid

	def redraw(self, force=False):
		# It's cool to see boards solved before your eyes, but some boards
		# take way too long if we redraw after every graphics call. This
		# redraws (on average) every 50th call to speed things up a bit.
		if force or random.randint(1, 50) == 1:
			self.grid.Refresh()
			self.grid.Update()

	def attempt(self, num, row, col):
		'''
		Graphically indicate that we are attempting to solve the board using
		the number num at position (row, col).
		'''
		self.grid.SetCellValue(row, col, str(num))
		self.grid.SetCellTextColour(row, col, wx.BLUE)
		self.redraw()

	def accept(self, row, col):
		'''
		Indicate that the board has a solution using the current value
		placed at (row, col).
		'''
		self.grid.SetCellTextColour(row, col, wx.GREEN)
		self.redraw()

	def reject(self, row, col):
		'''
		Briefly show that we are rejecting the current attempt at (row, col)
		and moving on to a different choice.
		'''
		self.grid.SetCellTextColour(row, col, wx.RED)
		self.redraw()
		self.grid.SetCellValue(row, col, '')
		self.redraw()

	def getBoard(self):
		'''
		Return a list-of-lists representing the currently displayed board.
		'''
		return [[StringToSudoku(self.grid.GetCellValue(row, col))
				 for col in range(sudoku.ROW_SIZE)]
				 for row in range(sudoku.ROW_SIZE)]

	def setBoard(self, board):
		'''Change the values displayed to those given by board.'''
		for row in range(self.grid.GetNumberRows()):
			for col in range(self.grid.GetNumberCols()):
				self.grid.SetCellValue(row, col, SudokuToString(board[row][col])) 

	def clear(self, evt):
		'''Set all cells of the displayed board to empty.'''
		for row in range(self.grid.GetNumberRows()):
			for col in range(self.grid.GetNumberCols()):
				self.grid.SetCellTextColour(row, col, wx.BLACK)
				self.grid.SetCellValue(row, col, '')

	def solve(self, evt):
		'''
		Solve the current board, giving a graphical representation of how
		the solver program is attempting a solution.
		'''
		# This is where we call the function we wrote. Notice that self gets
		# passed in as the graphics parameter, so when solve calls
		# graphics.attempt, for example, it calls the attempt method of this
		# object.
		sudoku.solve(self.getBoard(), self)
		self.redraw(force=True)

	def load(self, evt):
		'''
		Open a file dialog and load a Sudoku board specified by the user
		into the display.
		'''
		dlg = wx.FileDialog(self.grid,
				message="Choose a file",
				defaultDir=os.path.join(os.getcwd(), 'boards'), 
				style=wx.OPEN | wx.CHANGE_DIR)

		if dlg.ShowModal() == wx.ID_OK: 
			self.clear(None)
			self.setBoard(BoardFromFile(dlg.GetPath()))

		dlg.Destroy()

def BoardFromFile(path):
	'''
	Read the file specified by path, and return its contents converted to
	the standard list-of-lists-of-numbers format used by the Sudoku solver.
	'''
	board = []
	with open(path, 'r') as boardFile:
		for line in boardFile:
			board.append(map(StringToSudoku, line))
	return board

def MainMenu(window, board):
	'''Initialize the menu bar at the top of the window.'''
	menu = wx.MenuBar()
	
	boardMenu = wx.Menu()
	boardMenu.Append(wx.ID_OPEN, 'L&oad\tCtrl+O',
			'Load a Sudoku board from a text file')
	window.Bind(wx.EVT_MENU, board.load, id=wx.ID_OPEN)
	boardMenu.Append(wx.ID_CLOSE, '&Clear\tCtrl+W',
			'Clear the board')
	window.Bind(wx.EVT_MENU, board.clear, id=wx.ID_CLOSE)
	
	menu.Append(boardMenu, '&Board')
	window.SetMenuBar(menu)

def MainWindow():
	'''Initialize the main graphical window.'''
	window = wx.Frame(parent=None, title='Sudoku')

	board = SudokuBoard(window)

	MainMenu(window, board)

	solveButton = wx.Button(parent=window, label='Solve')
	window.Bind(wx.EVT_BUTTON, board.solve, solveButton)

	layout = wx.BoxSizer(wx.VERTICAL)
	layout.Add(board.grid, 0, wx.CENTER)
	layout.Add(solveButton, 0, wx.CENTER)

	window.SetSizer(layout)
	window.Fit()

	window.Show()

# This test asks whether this is the main module that we're running, as
# opposed to importing it just to use StringToSudoku or something. We only
# want to pop up our awesome window if this module is the star of the show.
if __name__ == '__main__':
	app = wx.App()
	MainWindow()
	app.MainLoop()
