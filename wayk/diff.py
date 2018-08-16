from datetime import timedelta

prev = timedelta()
n = -1
while True:
	try:
		line = raw_input()
	except (IOError, EOFError):
		print('')
		break
	if not line.strip():
		continue
	time = line.strip().split()[-1]
	if ':' not in time:
		continue
	chunks = [float(z) for z in time.split(':')]
	next = timedelta(hours=chunks[0],
	                 minutes=chunks[1],
			 seconds=chunks[2])
	print('{} {}'.format(n, next - prev))
	n += 1
	prev = next
