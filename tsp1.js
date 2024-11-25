from ortools.sat.python import cp_model
import sys

# Read all input
input = sys.stdin.read().splitlines()
idx = 0

# Read n
n = int(input[idx].strip())
idx += 1

# Read distance matrix
d = []
for _ in range(n):
    line = input[idx].strip()
    if line == '':

        idx +=1
        line = input[idx].strip()
    row = list(map(int, line.split()))
    if len(row) < n:
        while len(row) < n:
            idx +=1
            row += list(map(int, input[idx].strip().split()))
    d.append(row)
    idx +=1


while idx < len(input) and input[idx].strip() == '':
    idx +=1
if idx >= len(input):
    m =0
    constraints = []
else:
    m = int(input[idx].strip())
    idx +=1

    
    constraints = []
    for _ in range(m):
        while idx < len(input) and input[idx].strip() == '':
            idx +=1
        if idx >= len(input):
            break
        line = input[idx].strip()
        if line == '':
            idx += 1
            continue
        i, j = map(int, line.split())
       
        constraints.append( (i-1, j-1) )
        idx +=1

 
    constraints = list(set(constraints))

# Initialize CP-SAT model
model = cp_model.CpModel()


node_at_pos = [model.NewIntVar(0, n-1, f'node_at_pos_{k}') for k in range(n)]

model.AddAllDifferent(node_at_pos)

model.Add(node_at_pos[0] == 0)

pos = [model.NewIntVar(0, n-1, f'pos_{i}') for i in range(n)]

# Add inverse relationship: pos[node_at_pos[k]] == k
model.AddInverse(node_at_pos, pos)

# Add precedence constraints: pos[i] < pos[j]
for (i, j) in constraints:
    model.Add(pos[i] < pos[j])

# Define distance variables
distance_vars = []
for k in range(n):
    next_k = (k +1) % n
    distance_var = model.NewIntVar(0, 1000000, f'distance_{k}')
    distance_vars.append(distance_var)
    current_node = node_at_pos[k]
    next_node = node_at_pos[next_k]
    # Add table constraint: distance_var == d[current][next]
    # Prepare allowed tuples
    allowed = []
    for i in range(n):
        for j in range(n):
            allowed.append( (i, j, d[i][j]) )
    model.AddAllowedAssignments([current_node, next_node, distance_var], allowed)

# Define total distance
total_distance = model.NewIntVar(0, 1000000 * n, 'total_distance')
model.Add(total_distance == sum(distance_vars))

# Set objective
model.Minimize(total_distance)

# Solve the model
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = 10.0  
status = solver.Solve(model)

if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
    print(solver.Value(total_distance))
else:
    print("-1")


