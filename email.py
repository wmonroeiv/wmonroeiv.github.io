#!/usr/bin/env python

you_can_use_this = 'http://repl.it/languages/Python'
or_this = 'http://mathcs.holycross.edu/~kwalsh/python/'

who = 'Will Monroe'
where = 'Stanford'
whatthe = '*&^% $#@!'

holygrail = or_this.find('holy')
print(''.join([s[b:e] for s, b, e in [(who, 0, 1), (who, 5, None), (str(len(whatthe.split()[0])), None, None), (whatthe, -2, -1), (or_this, holygrail - 3, holygrail), (where, None, None), (or_this, holygrail + 9, holygrail + 13)]]).lower())
