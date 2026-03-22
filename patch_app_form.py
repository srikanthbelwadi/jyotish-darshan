import sys

with open('src/App.jsx', 'r') as f:
    app_code = f.read()

# 1. Add state variable
target_state = "function InputForm({onSubmit,lang,setLang}){\n  const[form,setForm]=React.useState({dob:'',tob:'',city:'',country:'India',gender:'',lat:null,lng:null,utcOffset:5.5,timezone:'Asia/Kolkata'});"
new_state = "function InputForm({onSubmit,lang,setLang}){\n  const[form,setForm]=React.useState({dob:'',tob:'',city:'',country:'India',gender:'',lat:null,lng:null,utcOffset:5.5,timezone:'Asia/Kolkata'});\n  const[name,setName]=React.useState('');"

if target_state in app_code:
    app_code = app_code.replace(target_state, new_state)
else:
    print("Failed to find state target")
    sys.exit(1)

# 2. Add validation
target_val = "function validate(){\n    const e={};\n    if(!form.dob)e.dob"
new_val = "function validate(){\n    const e={};\n    if(!name.trim())e.name=t('validation.required',lang)||t('required',lang);\n    if(!form.dob)e.dob"

if target_val in app_code:
    app_code = app_code.replace(target_val, new_val)
else:
    print("Failed to find validation target")
    sys.exit(1)

# 3. Add to submit payload
target_sub = "setTimeout(()=>onSubmit({year,month,day,hour,minute,utcOffset:form.utcOffset,lat:form.lat,lng:form.lng,city:form.city,country:form.country,timezone:form.timezone,gender:form.gender,dob:form.dob,tob:form.tob}),600);"
new_sub = "setTimeout(()=>onSubmit({name:name.trim()||'Anonymous',year,month,day,hour,minute,utcOffset:form.utcOffset,lat:form.lat,lng:form.lng,city:form.city,country:form.country,timezone:form.timezone,gender:form.gender,dob:form.dob,tob:form.tob}),600);"

if target_sub in app_code:
    app_code = app_code.replace(target_sub, new_sub)
else:
    print("Failed to find submit target")
    sys.exit(1)


# 4. Insert UI Field
target_ui = "          <form onSubmit={submit} style={{padding:'34px'}}>"

new_ui = target_ui + """
            <div style={{marginBottom:24}}>
              <label style={LS}>Full Name</label>
              <input type="text" className="lux-input" value={name} onChange={e=>{setName(e.target.value);setErrs(er=>({...er,name:null}))}} placeholder="Enter name (e.g. Rahul)..." style={{borderColor:errs.name?'var(--error-color)':'var(--border-light)'}} required />
              {errs.name&&<p style={{color:'var(--error-color)',fontSize:11,margin:'4px 0 0'}}>{errs.name}</p>}
            </div>"""

if target_ui in app_code:
    app_code = app_code.replace(target_ui, new_ui)
else:
    print("Failed to find UI target")
    sys.exit(1)

with open('src/App.jsx', 'w') as f:
    f.write(app_code)
print("Successfully patched App.jsx InputForm!")
