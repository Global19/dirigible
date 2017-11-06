package org.eclipse.dirigible.runtime.ide.generation.processor;

import static java.text.MessageFormat.format;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.eclipse.dirigible.commons.api.helpers.ContentTypeHelper;
import org.eclipse.dirigible.commons.api.helpers.GsonHelper;
import org.eclipse.dirigible.commons.api.scripting.ScriptingException;
import org.eclipse.dirigible.core.workspace.api.IFile;
import org.eclipse.dirigible.core.workspace.api.IProject;
import org.eclipse.dirigible.core.workspace.api.IWorkspace;
import org.eclipse.dirigible.engine.api.script.ScriptEngineExecutorsManager;
import org.eclipse.dirigible.engine.js.api.IJavascriptEngineExecutor;
import org.eclipse.dirigible.repository.api.IRepositoryStructure;
import org.eclipse.dirigible.repository.api.IResource;
import org.eclipse.dirigible.repository.api.RepositoryPath;
import org.eclipse.dirigible.runtime.ide.workspaces.processor.WorkspaceProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;

/**
 * Processing the Generation Service incoming requests
 */
public class GenerationProcessor extends WorkspaceProcessor {

	private static final String ACTION_COPY = "copy";
	private static final String ACTION_GENERATE = "generate";
	private static final Logger logger = LoggerFactory.getLogger(GenerationProcessor.class);

	public List<IFile> generateFile(String workspace, String project, String path, GenerationTemplateParameters parameters) throws ScriptingException, IOException {
		IWorkspace workspaceObject = getWorkspacesCoreService().getWorkspace(workspace);
		IProject projectObject = workspaceObject.getProject(project);
		List<IFile> generatedFiles = new ArrayList<IFile>();
		addStandardParameters(workspace, project, path, parameters);
		
		String wrapper = generateWrapper(parameters);
		Object metadata = ScriptEngineExecutorsManager.executeServiceCode(IJavascriptEngineExecutor.JAVASCRIPT_TYPE_DEFAULT, wrapper, null);
		if (metadata != null) {
			GenerationTemplateMetadata metadataObject = GsonHelper.GSON.fromJson(metadata.toString(), GenerationTemplateMetadata.class);
			
			for (GenerationTemplateMetadataSource source : metadataObject.getSources()) {
				String sourcePath = new RepositoryPath().append(IRepositoryStructure.PATH_REGISTRY_PUBLIC).append(source.getLocation()).build();
				IResource sourceResource = projectObject.getRepository().getResource(sourcePath);
				if (sourceResource.exists()) {
					byte[] input = sourceResource.getContent();
					logger.trace("Generating using template from the Registry: " + sourcePath);
					generateWithTemplate(parameters, projectObject, generatedFiles, source, input);
				} else {
					InputStream in = GenerationProcessor.class.getResourceAsStream(source.getLocation());
					if (in != null) {
						byte[] input = IOUtils.toByteArray(in);
						logger.trace("Generating using built-in template: " + source.getLocation());
						generateWithTemplate(parameters, projectObject, generatedFiles, source, input);
					} else {
						throw new ScriptingException(format("Invalid source location of [{0}] in template definition file: [{1}] or the resource does not exist", source.getLocation(), parameters.getTemplate()));
					}
				}
			}
			return generatedFiles;
			
		}
		
		throw new ScriptingException(format("Invalid template definition file: [{0}]", parameters.getTemplate()));
	}

	private void generateWithTemplate(GenerationTemplateParameters parameters, IProject projectObject,
			List<IFile> generatedFiles, GenerationTemplateMetadataSource source, byte[] input) throws IOException, ScriptingException {
		byte[] output = null;
		String action = source.getAction();
		if (action != null) {
			if (ACTION_GENERATE.equals(action)) {
				output = generateContent(parameters, source.getLocation(), input);
			} else if (ACTION_COPY.equals(action)) {
				output = input;
			} else {
				throw new ScriptingException(format("Invalid action in template definition: [{0}]", action));
			}
		} else {
			output = input;
		}
		
		String generatedFileName; 
		String rename = source.getRename();
		if (rename != null) {
			generatedFileName = generateName(parameters, source.getLocation() + "-name", rename);
		} else {
			generatedFileName = new RepositoryPath().append(source.getLocation()).getLastSegment();
		}
		String generatedFilePath = new RepositoryPath().append(parameters.getParameters().get("packagePath").toString()).append(generatedFileName).build();
		String contentType = ContentTypeHelper.getContentType(ContentTypeHelper.getExtension(generatedFileName));
		boolean isBinary = ContentTypeHelper.isBinary(contentType);
		IFile fileObject = projectObject.createFile(generatedFilePath, output, isBinary, contentType);
		generatedFiles.add(fileObject);
	}

	private String generateWrapper(GenerationTemplateParameters parameters) {
		String wrapper = new StringBuilder()
			.append("var template = require('")
			.append(parameters.getTemplate())
			.append("');JSON.stringify(template.getTemplate());").toString();
		return wrapper;
	}

	private void addStandardParameters(String workspace, String project, String path,
			GenerationTemplateParameters parameters) {
		RepositoryPath filePath = new RepositoryPath().append(path);
		RepositoryPath packagePath = new RepositoryPath().append(path).getParentPath();
		String fileName = filePath.getLastSegment();
		String fileNameExt = FilenameUtils.getExtension(fileName);
		String fileNameBase = FilenameUtils.getBaseName(fileName);
		
		parameters.getParameters().put("workspaceName", workspace);
		parameters.getParameters().put("projectName", project);
		parameters.getParameters().put("fileName", fileName);
		parameters.getParameters().put("fileNameExt", fileNameExt);
		parameters.getParameters().put("fileNameBase", fileNameBase);
		parameters.getParameters().put("filePath", filePath.build());
		parameters.getParameters().put("packagePath", packagePath.build());
	}

	private byte[] generateContent(GenerationTemplateParameters parameters, String location,
			byte[] input) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Writer writer = new OutputStreamWriter(baos);
		MustacheFactory mf = new DefaultMustacheFactory();
		Mustache mustache = mf.compile(new InputStreamReader(new ByteArrayInputStream(input)), location);
		mustache.execute(writer, parameters.getParameters());
		writer.flush();
		return baos.toByteArray();
	}
	
	private String generateName(GenerationTemplateParameters parameters, String location,
			String input) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Writer writer = new OutputStreamWriter(baos);
		MustacheFactory mf = new DefaultMustacheFactory();
		Mustache mustache = mf.compile(new StringReader(input), location);
		mustache.execute(writer, parameters.getParameters());
		writer.flush();
		return new String(baos.toByteArray(), StandardCharsets.UTF_8);
	}

}
