const fhirServer = "https://hapi.fhir.org/baseR4/";
const headersJson = "./header.json";
const Support = "./StructureDefinition-Patient-twcore.json";

async function loadIntoTable(resource, table) {
    //resource = resource.toLowerCase();
    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");
    const responseData = await fetch(fhirServer + resource);
    const responseHeader = await fetch(headersJson);
    const responseSupport = await fetch(Support);

    const { entry } = await responseData.json();
    const { headers } = await responseHeader.json();
    const { differential } = await responseSupport.json();
    // differential.element.map((item) => {
    //     item.mustSupport && console.log(item.id);
    // });
    
    tableHead.innerHTML = "<tr></tr>";
    tableHead.tableBody = "";
    //產生header
    for (const headerText of headers[resource]) {
        const headerElement = document.createElement("th");
        headerElement.textContent = headerText;
        tableHead.querySelector("tr").appendChild(headerElement);
    }

    //產生內容
    for (const row of entry) {
        const rowElement = document.createElement("tr");

        //按下table
        rowElement.addEventListener("click", () => {
            showHideRow(row.resource.id);
        });

        //根據header渲染row
        for (const header of headers[resource]) {
            const cellElement = document.createElement("td");

            //判斷值是否有下一層
            if (typeof row.resource[header] === "string") {
                cellElement.textContent = row.resource[header];
            } else if (typeof row.resource[header] === "object") {
                const html = row.resource[header]; //objectToString(row.resource[header]);
                cellElement.innerHTML = html;
            }
            rowElement.appendChild(cellElement);
        }

        //expand 下方展開列
        const expand = document.createElement("tr");
        expandOpen(expand, row, headers, resource);

        tableBody.appendChild(rowElement);
        tableBody.appendChild(expand);
    }
}

//將object轉成string
function objectToString(jsons) {
    var html = "";
    for (var json of jsons) {
        var result = [];
        for (var i in json) result.push([i, json[i]]);
        result.map((item) => {
            html += `<b>${item[0]}</b>:`;
            html += `${JSON.stringify(item[1])},　`;
        });
    }
    return html;
}

//下方展開列
function expandOpen(expand, row, headers, resource) {
    function ExpanRender() {
        var html = `<button onclick="copyButtonFunction()">Copy Json</button>
        <a id="exportJSON" onclick="downJsonButton(this);" class="btn" download>Download Json</a>
        <textarea  style="width:100%;height:500px;" id="jsonTextarea" name="jsonTextarea">${JSON.stringify(
            row,
            undefined,
            2
        )}
        </textarea>`;
        // for (const header of headers[resource]) {
        //     if (typeof row.resource[header] === "object") {
        //         html += `<h5><b>${header}</b></h5>`;
        //         const htmlobj = objectToString(row.resource[header]);
        //         html += `<p>${htmlobj}</p>`;
        //     } else if (typeof row.resource[header] === "string") {
        //         html += `<h5><b>${header}</b></h5>`;
        //         html += `<p>${row.resource[header]}</p>`;
        //     }
        // }
        return html;
    }
    const html = ExpanRender();
    expand.id = row.resource.id;
    expand.className = "hidden_row";
    expand.innerHTML = `
            <td colspan=${headers[resource].length}>
                ${html}
            </td>

    
`;
}

//下方展開列
function showHideRow(row) {
    $("#" + row).toggle();
}

//複製按鈕
function copyButtonFunction() {
    var copyText = document.getElementById("jsonTextarea");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
}

function downJsonButton(el) {
    var copyText = document.getElementById("jsonTextarea");
    var data = "text/json;charset=utf-8," + encodeURIComponent(copyText.value);

    //console.log();

    const filename = `${JSON.parse(copyText.value).resource.resourceType}_${
        JSON.parse(copyText.value).resource.id
    }.json`;
    el.setAttribute("href", "data:" + data);
    el.setAttribute("download", `${filename}`);
}

//渲染MenuBar
async function menuBar(header) {
    const menuBarDiv = document.querySelector(".meunBar");
    const responseHeader = await fetch(header);
    const { headers } = await responseHeader.json();
    const JsonArray = Object.entries(headers);
    menuBarDiv.innerHTML = `<li><a class="active">Resource</a></li>`;

    for (const header of JsonArray) {
        menuBarDiv.innerHTML += `<li><a onclick={loadIntoTable(loadIntoTable("${header[0]}",document.querySelector("table")))}>${header[0]}</a></li>`;
    }
}

menuBar("./header.json");
