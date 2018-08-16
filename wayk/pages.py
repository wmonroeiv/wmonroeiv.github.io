# -*- coding: utf-8 -*-
from datetime import datetime
import numpy as np
import scipy.stats as st


def count_beats():
    prompt = '[start   ]'

    pages = []
    while True:
        _ = raw_input(prompt)
        pages.append(datetime.now())
        prompt = '[page {:3d}]'.format(len(pages) - 1)
        prompt += ' {}'.format(pages[-1] - pages[0])


if __name__ == '__main__':
    try:
        count_beats()
    except KeyboardInterrupt:
        print('')
        pass
