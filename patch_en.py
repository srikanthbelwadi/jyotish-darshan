with open('src/App.jsx', 'r') as f:
    appStr = f.read()

target = "en:{generate:"
new_strs = "en:{newChart:'New Chart',currentProfile:'Current',profile:'Profile',todayHorizon:\"Today's Cosmic Horizon\",weekAhead:'The Week Ahead',favorable:'Favorable',mixed:'Mixed',challenging:'Challenging',ovDailyWeather:'Daily Weather',horToday:'Today',horTmrw:'Tmrw',generate:"

if target in appStr:
    appStr = appStr.replace(target, new_strs)
    with open('src/App.jsx', 'w') as f:
        f.write(appStr)
    print("Patched English strings!")
else:
    print("Target not found.")

