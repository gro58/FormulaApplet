import LatexFormatter from '../../src/formatters/FormatterLatex'
import assert from 'assert'

describe('formatter latex', () => {
  let format = ast => {
    let formatter = new LatexFormatter(ast)
    return formatter.format()
  }

  it('format a general math example', () => {
    const ast = {
      type: 'operator',
      operator: 'multiply',
      lhs: {
        type: 'operator',
        operator: 'plus',
        lhs: {
          type: 'number',
          value: 2,
        },
        rhs: {
          type: 'number',
          value: 3,
        },
      },
      rhs: {
        type: 'operator',
        operator: 'divide',
        lhs: {
          type: 'number',
          value: 5,
        },
        rhs: {
          type: 'number',
          value: 1,
        },
      },
    }

    assert.equal(format(ast), '\\left(2+3\\right)\\cdot \\frac{5}{1}')
  })

  it('format division', () => {
    const ast = {
      type: 'operator',
      operator: 'divide',
      lhs: {
        type: 'number',
        value: 1,
      },
      rhs: {
        type: 'operator',
        operator: 'multiply',
        lhs: {
          type: 'number',
          value: 3,
        },
        rhs: {
          type: 'number',
          value: 4,
        },
      },
    }

    assert.equal(format(ast), '\\frac{1}{3\\cdot 4}')
  })

  describe('exponents', () => {
    it('parse expression with exponents', () => {
      const ast = {
        type: 'operator',
        operator: 'minus',
        lhs: {
          type: 'operator',
          operator: 'exponent',
          lhs: {
            type: 'number',
            value: 3,
          },
          rhs: {
            type: 'operator',
            operator: 'plus',
            lhs: {
              type: 'number',
              value: 6,
            },
            rhs: {
              type: 'number',
              value: 4,
            },
          },
        },
        rhs: {
          type: 'operator',
          operator: 'exponent',
          lhs: {
            type: 'variable',
            value: 'var',
          },
          rhs: {
            type: 'number',
            value: 2,
          },
        },
      }

      assert.equal(format(ast), '3^{6+4}-var^{2}')
    })

    it('format nested exponents', () => {
      const ast = {
        type: 'operator',
        operator: 'exponent',
        lhs: {
          type: 'number',
          value: 3,
        },
        rhs: {
          type: 'operator',
          operator: 'exponent',
          lhs: {
            type: 'number',
            value: 5,
          },
          rhs: {
            type: 'operator',
            operator: 'minus',
            lhs: {
              type: 'number',
              value: 22,
            },
            rhs: {
              type: 'number',
              value: 3,
            },
          },
        },
      }

      assert.equal(format(ast), '3^{5^{22-3}}')
    })
  })

  it('format exponents of negative numbers with curley braces', () => {
    const ast = {
      type: 'operator',
      operator: 'exponent',
      lhs: {
        type: 'number',
        value: 3,
      },
      rhs: {
        type: 'number',
        value: -1,
      },
    }

    assert.equal(format(ast), '3^{-1}')
  })

  it('should format latex with spaces correctly', () => {
    const parsedLatex = {
      type: 'operator',
      operator: 'multiply',
      lhs: {
        type: 'variable',
        value: 'var',
      },
      rhs: {
        type: 'variable',
        value: 'var',
      },
    }

    assert.equal(format(parsedLatex), 'var\\cdot var')
  })

  describe('functions', () => {
    it('should format sqrt function', () => {
      const parsedLatex = {
        type: 'function',
        value: 'sqrt',
        content: {
          type: 'number',
          value: 123,
        },
      }

      assert.equal(format(parsedLatex), '\\sqrt{123}', 'sqrt example')
    })

    it('format negated function', () => {
      const parsedLatex = {
        type: 'uni-operator',
        operator: 'minus',
        value: {
          type: 'function',
          value: 'sin',
          content: {
            type: 'number',
            value: '90',
          },
        },
      }

      assert.equal(format(parsedLatex), '-\\sin\\left(90\\right)')
    })
  })

  describe('equations', () => {
    it('should format simple equation with variables and numbers', () => {
      const parsedLatex = {
        type: 'equation',
        lhs: {
          type: 'variable',
          value: 'y',
        },
        rhs: {
          type: 'operator',
          operator: 'plus',
          lhs: {
            type: 'operator',
            operator: 'multiply',
            lhs: {
              type: 'variable',
              value: 'a',
            },
            rhs: {
              type: 'variable',
              value: 'x',
            },
          },
          rhs: {
            type: 'operator',
            operator: 'multiply',
            lhs: {
              type: 'number',
              value: 2,
            },
            rhs: {
              type: 'variable',
              value: 'b',
            },
          },
        },
      }

      assert.equal(format(parsedLatex), 'y=a\\cdot x+2\\cdot b')
    })
  })

  describe('greek letters', () => {
    it('should format lower case', () => {
      const parsedLatex = {
        type: 'operator',
        operator: 'multiply',
        lhs: {
          type: 'variable',
          value: 'alpha',
        },
        rhs: {
          type: 'variable',
          value: 'beta',
        },
      }

      assert.equal(format(parsedLatex), '\\alpha\\cdot \\beta')
    })

    it('should format upper case', () => {
      const parsedLatex = {
        type: 'operator',
        operator: 'multiply',
        lhs: {
          type: 'variable',
          value: 'Alpha',
        },
        rhs: {
          type: 'variable',
          value: 'Delta',
        },
      }

      assert.equal(format(parsedLatex), '\\Alpha\\cdot \\Delta')
    })
  })

  it('format variables with subscripts', () => {
    const parsedLatex = {
      type: 'operator',
      operator: 'minus',
      lhs: {
        type: 'subscript',
        base: {
          type: 'variable',
          value: 't',
        },
        subscript: {
          type: 'variable',
          value: 'last',
        },
      },
      rhs: {
        type: 'subscript',
        base: {
          type: 'variable',
          value: 't',
        },
        subscript: {
          type: 'subscript',
          base: {
            type: 'variable',
            value: 'first',
          },
          subscript: {
            type: 'variable',
            value: 'a',
          },
        },
      },
    }

    assert.equal(format(parsedLatex), 't_{last}-t_{first_a}')
  })
})
