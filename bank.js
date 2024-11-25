from ortools.linear_solver import pywraplp
import sys

# Read all input at once
input_data = sys.stdin.read().splitlines()
idx = 0
A, n, m, alpha = map(int, input_data[idx].strip().split())
idx += 1

t = list(map(int, input_data[idx].strip().split()))
idx += 1
u = list(map(int, input_data[idx].strip().split()))
idx += 1
r = list(map(int, input_data[idx].strip().split()))
idx += 1
p = list(map(int, input_data[idx].strip().split()))
idx += 1
a = list(map(int, input_data[idx].strip().split()))

# Create the solver with the GLOP backend
solver = pywraplp.Solver.CreateSolver('GLOP')
if not solver:
    print('-1')
    sys.exit()

# Define the variables x_i
x = [solver.NumVar(0, u[i], f'x_{i}') for i in range(n)]
# add sum of x = A
solver.Add(solver.Sum(x) <= A)
# add sum of t[i] * x[i] where t[i] = j <= a[j]
for i in range(m):
    sum = 0
    for j in range(n):
        if t[j] == i+1:
            sum += x[j]
    solver.Add(sum <= a[i])

solver.Add(solver.Sum(x[i] * r[i] for i in range(n)) <= alpha * solver.Sum(x))

# find maxium of sum of p[i] * x[i]
solver.Maximize(solver.Sum(p[i] * x[i] for i in range(n)))

status = solver.Solve()

if status == pywraplp.Solver.OPTIMAL:
    print(f"{solver.Objective().Value()/100:0.1f}")
else:
    print(-1)   
